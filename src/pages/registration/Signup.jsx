import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { fireDB } from "../../firebase/FirebaseConfig";
import {
  Timestamp,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Loader from "../../components/loader/Loader";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import emailjs from "@emailjs/browser";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // States to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signup = async () => {
    setLoading(true);

    // Validate fields
    if (
      !name ||
      !email ||
      !mobile ||
      !dateOfBirth ||
      !password ||
      !confirmPassword
    ) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be exactly 10 digits");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const usersRef = collection(fireDB, "users");

      // Check for duplicate mobile number
      const mobileQuery = query(usersRef, where("mobile", "==", mobile));
      const querySnapshot = await getDocs(mobileQuery);
      if (!querySnapshot.empty) {
        toast.error("Mobile number already in use");
        setLoading(false);
        return;
      }

      // Prepare user data (note: avoid storing plain text passwords in production)
      const userData = {
        name,
        email,
        mobile,
        dateOfBirth,
        password,

        paymentDetail: false,
        suspended: false,
        loginCount: 0,

        createdAt: Timestamp.now(),
        submitCount: 0,
      };

      await addDoc(usersRef, userData);
      toast.success("Signup Successful");

      // Clear fields
      setName("");
      setEmail("");
      setMobile("");
      setDateOfBirth("");
      setPassword("");
      setConfirmPassword("");

      // Prepare email template parameters
      const templateParams = {
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        // Convert Firestore timestamp to a human-readable format
        createdAt: new Date(userData.createdAt.seconds * 1000).toLocaleString(),
      };

      // Send email via EmailJS
      emailjs
        .send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams,
          import.meta.env.VITE_EMAILJS_USER_ID
        )
        .then(
          (response) => {
            console.log(
              "Email sent successfully!",
              response.status,
              response.text
            );
          },
          (error) => {
            console.error("Failed to send email...", error);
          }
        );
    } catch (error) {
      toast.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r bg-gray-100">
      {loading && <Loader />}
      <div className="bg-white shadow-lg px-8 py-10 rounded-xl max-w-md w-full">
        <p className="mb-4 text-center text-sm font-semibold text-[#fd2695] bg-slate-100">
          Please enter your correct date of birth. It will be used to reset your
          password if you ever forget it.
        </p>
        <h1 className="text-center text-2xl mb-6 font-bold text-[#b12c71]">
          Signup
        </h1>
        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="dateOfBirth"
            className="block text-gray-500 font-semibold ml-1"
          >
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <div className="mb-6 relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <button
            onClick={signup}
            className="w-full bg-[#6D0B3E] text-white py-2 rounded-md hover:bg-[#3b021f] transition-colors font-semibold shadow-md"
          >
            Signup
          </button>
        </div>
        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link
            to="/login"
            className="text-[#6D0B3E] font-bold hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
