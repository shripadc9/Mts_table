import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Retrieve the current user's info from localStorage.
  // Ensure that your login process stores the user object with an "email" field.
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userEmail = storedUser?.email;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) {
        toast.error("No user email found in localStorage.");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const usersRef = collection(fireDB, "users");
        const q = query(usersRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          toast.error("User data not found for email: " + userEmail);
        } else {
          // Assuming only one document per email.
          setUserData(querySnapshot.docs[0].data());
        }
      } catch (error) {
        toast.error("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userEmail]);

  // Helper functions to format Firestore Timestamps.
  const formatDate = (ts) => {
    if (!ts) return "N/A";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString();
  };

  const formatDateTime = (ts) => {
    if (!ts) return "N/A";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-500">
          No user data available for {userEmail}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#27667B]">
      {/* Header Banner */}
      <header className="bg-gradient-to-r bg-[#27667B]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl text-white font-bold">My Profile</h1>
          <p className="mt-2 text-lg text-white">
            Manage account details and view payment history
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Details Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            Account Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {userData.name || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {userData.email || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Mobile:</span>{" "}
                {userData.mobile || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Payment Detail:</span>{" "}
                {userData.paymentDetail || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Payment Date:</span>{" "}
                {formatDate(userData.paymentDate)}
              </p>
            </div>
            {/* Right Column */}
            <div className="space-y-3">
              <p>
                <span className="font-semibold">Payment Amount:</span>{" "}
                {userData.paymentAmount ? `${userData.paymentAmount}` : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Subscription Date:</span>{" "}
                {formatDate(userData.subscriptionDate)}
              </p>
              <p>
                <span className="font-semibold">Subscription Time:</span>{" "}
                {userData.subscriptionTime || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={
                    userData.suspended
                      ? "text-red-600 font-bold"
                      : "text-green-600 font-bold"
                  }
                >
                  {userData.suspended ? "Suspended" : "Active"}
                </span>
              </p>
              {userData.suspended && (
                <p className="text-sm text-red-500">
                  Your account is suspended because your subscription time is
                  over. Please make a payment to activate your account.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Payment History Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            Payment History
          </h2>
          {userData.paymentHistory && userData.paymentHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscription Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {userData.paymentHistory.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.paymentDetail || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(record.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.paymentAmount
                          ? `${record.paymentAmount}`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.subscriptionTime || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDateTime(record.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No payment history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
