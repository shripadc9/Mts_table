import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { fireDB } from "../../firebase/FirebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";

function ForgotPassword() {
  const [identifier, setIdentifier] = useState(""); // Email or mobile number
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    // Validate that all fields are provided.
    if (
      !identifier.trim() ||
      !dateOfBirth.trim() ||
      !newPassword ||
      !confirmNewPassword
    ) {
      toast.error("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      let loginEmail = identifier.trim();
      const usersRef = collection(fireDB, "users");
      let userDocRef = null;

      if (!loginEmail.includes("@")) {
        // If identifier is a mobile number.
        const q = query(usersRef, where("mobile", "==", loginEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          toast.error("No user found with that mobile number.");
          setLoading(false);
          return;
        }
        const userData = querySnapshot.docs[0].data();
        if (userData.dateOfBirth !== dateOfBirth) {
          toast.error("Date of birth does not match our records.");
          setLoading(false);
          return;
        }
        userDocRef = querySnapshot.docs[0].ref;
        // Optionally, use the email from the document:
        loginEmail = userData.email;
      } else {
        // If identifier is an email.
        const q = query(usersRef, where("email", "==", loginEmail));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          toast.error("No user found with that email.");
          setLoading(false);
          return;
        }
        const userData = querySnapshot.docs[0].data();
        if (userData.dateOfBirth !== dateOfBirth) {
          toast.error("Date of birth does not match our records.");
          setLoading(false);
          return;
        }
        userDocRef = querySnapshot.docs[0].ref;
      }

      // Update the password field in Firestore.
      await updateDoc(userDocRef, { password: newPassword });
      toast.success(
        "Password reset successful. Please log in with your new password."
      );
      navigate("/login");
    } catch (error) {
      console.error("Error resetting password: ", error);
      toast.error(error.message || "An error occurred during password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r bg-gray-100 p-4 space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Reset Password
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Email or Mobile Number
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Enter your email or mobile number"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D0B3E]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D0B3E]"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D0B3E]"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6D0B3E]"
          />
        </div>
        <button
          onClick={handleResetPassword}
          className="w-full bg-[#6D0B3E] text-white py-3 rounded-md hover:bg-[#31021a] transition-colors font-semibold"
        >
          {loading ? "Processing..." : "Reset Password"}
        </button>
        <div className="text-center mt-4">
          <span className="text-gray-600">Want to log in? </span>
          <Link to="/login" className="text-black font-bold hover:underline">
            Login
          </Link>
        </div>
        <p className="mt-4 text-center text-sm font-semibold text-rose-600 bg-slate-100">
          If you forget your date of birth, please contact to the Admin.
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
