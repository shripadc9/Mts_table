import React, { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { fireDB } from "../../../firebase/FirebaseConfig";
import { toast } from "react-toastify";
import Loader from "../../../components/loader/Loader";

const ITEMS_PER_PAGE = 10;

function LoginDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  // Payment modal and extra details states
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [paymentDetail, setPaymentDetail] = useState("");
  const [paymentDate, setPaymentDate] = useState(""); // date input
  const [paymentAmount, setPaymentAmount] = useState("");
  const [subscriptionTime, setSubscriptionTime] = useState("");
  const [suspendedStatus, setSuspendedStatus] = useState("");
  // New states for extra fields
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [submitCount, setSubmitCount] = useState(""); // Renamed from submitCunt
  const [createdAt, setCreatedAt] = useState("");

  // Search, month filter, and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1)
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(fireDB, "users");
      const snapshot = await getDocs(usersRef);
      const usersList = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Helper to format Firestore timestamps.
  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  };

  // Update payment and extra details; also store history.
  const handleUpdatePayment = async () => {
    if (!paymentDetail || paymentAmount === "") {
      toast.error("Please fill in payment detail and amount");
      return;
    }
    try {
      const userDocRef = doc(fireDB, "users", selectedUserData.id);
      const updatedPaymentDate = paymentDate
        ? Timestamp.fromDate(new Date(paymentDate))
        : null;
      // Prepare a history record from the current values.
      const historyRecord = {
        paymentDetail: selectedUserData.paymentDetail || "N/A",
        paymentDate: selectedUserData.paymentDate || null,
        paymentAmount: selectedUserData.paymentAmount || "N/A",
        subscriptionTime: selectedUserData.subscriptionTime || "N/A",
        suspended: selectedUserData.suspended || false,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(userDocRef, {
        paymentHistory: arrayUnion(historyRecord),
        paymentDetail,
        paymentDate: updatedPaymentDate,
        paymentAmount: Number(paymentAmount),
        subscriptionTime,
        suspended: suspendedStatus === "Suspended",
        // Extra fields update
        dateOfBirth,
        password,
        submitCount: Number(submitCount),
        createdAt: createdAt ? Timestamp.fromDate(new Date(createdAt)) : null,
        updatedAt: Timestamp.now(),
      });
      toast.success("Payment and user details updated");
      fetchUsers();
      // Reset modal fields.
      setSelectedUserData(null);
      setPaymentDetail("");
      setPaymentDate("");
      setPaymentAmount("");
      setSubscriptionTime("");
      setSuspendedStatus("");
      setDateOfBirth("");
      setPassword("");
      setSubmitCount("");
      setCreatedAt("");
    } catch (error) {
      toast.error("Failed to update payment details");
    }
  };

  // Delete a user document.
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const userDocRef = doc(fireDB, "users", userId);
        await deleteDoc(userDocRef);
        toast.success("User deleted");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  // Toggle suspended status.
  const toggleSuspendUser = async (userId, currentStatus) => {
    try {
      const userDocRef = doc(fireDB, "users", userId);
      await updateDoc(userDocRef, {
        suspended: !currentStatus,
        updatedAt: Timestamp.now(),
      });
      toast.success(`User ${!currentStatus ? "suspended" : "unsuspended"}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  // Filter and sort users.
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      return (
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [users, searchTerm]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const getDate = (user) => {
        if (user.paymentDate) {
          return user.paymentDate.toDate
            ? user.paymentDate.toDate()
            : new Date(user.paymentDate);
        }
        return null;
      };
      const aDate = getDate(a);
      const bDate = getDate(b);
      if (aDate && bDate) return aDate - bDate;
      if (aDate) return -1;
      if (bDate) return 1;
      return 0;
    });
  }, [filteredUsers]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const displayedUsers = sortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Row highlighting based on payment date and selected month.
  const getRowClass = (user) => {
    let baseClass = "hover:bg-gray-50";
    if (user.paymentDate) {
      const paymentDateObj = user.paymentDate.toDate
        ? user.paymentDate.toDate()
        : new Date(user.paymentDate);
      if (!isNaN(paymentDateObj)) {
        const paymentMonth = paymentDateObj.getMonth() + 1;
        const filterMonth = Number(selectedMonth);
        if (filterMonth && paymentMonth <= filterMonth) {
          return baseClass + " bg-red-200";
        }
      }
    }
    return baseClass;
  };

  // Prefill modal fields when editing a user.
  const handleEditClick = (user) => {
    setSelectedUserData(user);
    setPaymentDetail(user.paymentDetail || "");
    if (user.paymentDate) {
      const dateObj = user.paymentDate.toDate
        ? user.paymentDate.toDate()
        : new Date(user.paymentDate);
      setPaymentDate(dateObj.toISOString().substr(0, 10));
    } else {
      setPaymentDate("");
    }
    setPaymentAmount(user.paymentAmount || "");
    setSubscriptionTime(user.subscriptionTime || "");
    setSuspendedStatus(user.suspended ? "Suspended" : "Active");
    // New fields: ensure you convert timestamps to ISO strings if needed.
    if (user.dateOfBirth) {
      setDateOfBirth(user.dateOfBirth);
    }
    if (user.password) {
      setPassword(user.password);
    }
    if (user.submitCount !== undefined) {
      setSubmitCount(user.submitCount);
    }
    if (user.createdAt) {
      const cDate = user.createdAt.toDate
        ? user.createdAt.toDate()
        : new Date(user.createdAt);
      setCreatedAt(cDate.toISOString().substr(0, 10));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl py-2 bg-[#6D0B3E] font-bold text-center mb-8 text-white">
        Login Payment Dashboard
      </h1>

      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="number"
          min="1"
          max="12"
          placeholder="Enter month (1-12)"
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-1/3 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Mobile
                </th>
                {/* Removed Hours Used column */}
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Submit Count
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Login Count
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Payment Detail
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Payment Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Payment Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Subscription Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                {/* New Data Cells */}
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Created At
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date of Birth
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Password
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedUsers.map((user) => (
                <tr key={user.id} className={getRowClass(user)}>
                  <td className="px-4 py-3 whitespace-nowrap">{user.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{user.mobile}</td>
                  {/* Removed Hours Used cell */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.submitCount !== undefined ? user.submitCount : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.loginCount || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.paymentDetail?.toString() || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.paymentDate
                      ? formatTimestamp(user.paymentDate)
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.paymentAmount !== undefined
                      ? user.paymentAmount
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.subscriptionTime || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.suspended ? (
                      <span className="text-red-600 font-bold">Suspended</span>
                    ) : (
                      <span className="text-green-600 font-bold">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.createdAt ? formatTimestamp(user.createdAt) : "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.dateOfBirth || "N/A"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.password || "N/A"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-center space-x-2">
                    <button
                      onClick={() => handleEditClick(user)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Edit Payment
                    </button>
                    <button
                      onClick={() => toggleSuspendUser(user.id, user.suspended)}
                      className={`${
                        user.suspended
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      } text-white px-3 py-1 rounded text-xs`}
                    >
                      {user.suspended ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selectedUserData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Update Payment and User Details
            </h2>
            <div className="space-y-4">
              {/* Payment Fields */}
              <input
                type="text"
                value={paymentDetail}
                onChange={(e) => setPaymentDetail(e.target.value)}
                placeholder="Enter Payment Detail"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter Payment Amount"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={subscriptionTime}
                onChange={(e) => setSubscriptionTime(e.target.value)}
                placeholder="Enter Subscription Time (e.g., '1 month')"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={suspendedStatus}
                onChange={(e) => setSuspendedStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
              {/* New Editable Fields */}
              <input
                type="text"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="Enter Date of Birth (YYYY-MM-DD)"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                value={submitCount}
                onChange={(e) => setSubmitCount(e.target.value)}
                placeholder="Enter Submit Count"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="mb-4">
                <label
                  htmlFor="createdAt"
                  className="block text-sm font-medium text-gray-700"
                >
                  Created Date
                </label>
                <input
                  type="date"
                  id="createdAt"
                  value={createdAt}
                  onChange={(e) => setCreatedAt(e.target.value)}
                  placeholder="Enter Created At Date"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setSelectedUserData(null);
                  setPaymentDetail("");
                  setPaymentDate("");
                  setPaymentAmount("");
                  setSubscriptionTime("");
                  setSuspendedStatus("");
                  setDateOfBirth("");
                  setPassword("");
                  setSubmitCount("");
                  setCreatedAt("");
                }}
                className="mr-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePayment}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginDashboard;
