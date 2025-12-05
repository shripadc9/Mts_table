import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { fireDB } from "../../firebase/FirebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  increment, // Import increment to update login count
} from "firebase/firestore";
import Loader from "../../components/loader/Loader";
import { v4 as uuidv4 } from "uuid"; // Ensure this package is installed: npm install uuid

function Login() {
  const [identifier, setIdentifier] = useState(""); // Email or mobile number.
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const usersRef = collection(fireDB, "users");
      let userQuery;
      if (identifier.includes("@")) {
        userQuery = query(usersRef, where("email", "==", identifier));
      } else {
        if (!/^\d{10}$/.test(identifier)) {
          toast.error("Please enter a valid 10-digit mobile number or email.");
          setLoading(false);
          return;
        }
        userQuery = query(usersRef, where("mobile", "==", identifier));
      }
      const querySnapshot = await getDocs(userQuery);
      if (querySnapshot.empty) {
        toast.error("No user found with that identifier.");
        setLoading(false);
        return;
      }
      const userDocSnapshot = querySnapshot.docs[0];
      const userDoc = userDocSnapshot.data();
      if (userDoc.password !== password) {
        toast.error("Incorrect password.");
        setLoading(false);
        return;
      }
      // Generate a session token and update Firestore with sessionToken and increment loginCount
      const sessionToken = uuidv4();
      const userDocRef = doc(fireDB, "users", userDocSnapshot.id);
      await updateDoc(userDocRef, {
        sessionToken,
        loginCount: increment(1), // Increment the login count by 1
      });
      // Save user data and session token in local storage
      localStorage.setItem(
        "user",
        JSON.stringify({ ...userDoc, sessionToken })
      );
      toast.success("Login Successful");
      navigate("/");
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r bg-gray-100 p-4 space-y-6">
      {loading && <Loader />}
      <div className="w-full max-w-md p-4 bg-white rounded-md shadow-md text-center">
        <p className="text-lg font-medium text-[#ff2596] bg-gray-100">
          To access the Chart Pattern Finder, login is required. If you don't
          have an account, you can create one.
        </p>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
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
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
        <div className="flex justify-center mb-6">
          <button
            onClick={handleLogin}
            className="w-full bg-[#6D0B3E] text-white py-3 rounded-md hover:bg-[#3b021f] transition-colors font-semibold shadow-md"
          >
            Login
          </button>
        </div>
        <div className="flex justify-between items-center">
          <Link
            to="/reset-password"
            className="text-sm text-[#6D0B3E] hover:underline"
          >
            Forgot Password?
          </Link>
          <Link to="/signup" className="text-sm text-[#6D0B3E] hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
