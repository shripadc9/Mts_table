// main.jsx
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { fireDB } from "./firebase/FirebaseConfig";
import Home from "./pages/home/Home";
import Order from "./pages/Order/Order";
import NoPage from "./pages/nopage/NoPage";
import MyState from "./context/data/myState";
import Login from "./pages/registration/Login";
import Signup from "./pages/registration/Signup";
import ForgotPassword from "./pages/registration/ResetPassword";
import PaymentPage from "./pages/payment/PaymentPage";
import KalyanPanelChart from "./pages/allCharts/kalyan/KalyanPanel";
import MumbaiPanel from "./pages/allCharts/mainMumbai/MumbaiPanel";
import MadhurDayChart from "./pages/allCharts/madhurDay/MadhurDay";
import MadhurNightChart from "./pages/allCharts/madhurNight/MadhurNight";
import PatternInput from "./pages/patternInput/PatternInput";
import DatabaseUpdate from "./pages/admin/chartUpdate/DatabaseUpdate";
import LiveMatkaDashboard from "./pages/admin/liveResult/LiveResultDashBoard";
import LoginDashboard from "./pages/admin/loginDashboard/LoginDashoard";
import Navbar from "./components/navbar/Navbar";
import ProfilePage from "./pages/profileAccount/ProfilePage";
import MilanDayChart from "./pages/allCharts/milanDay/MilanDay";
import MilanNightChart from "./pages/allCharts/milanNight/MilanNight";
import RajdhaniNightChart from "./pages/allCharts/rajdaniNight/RajdhaniNight";
import RajdhaniDayChart from "./pages/allCharts/rajdhaniDay/RajdhaniDay";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ContactPage from "./pages/contactUs/ContactUs";
import AdminPaymentDetail from "./pages/admin/paymentDetail/UpdatePaymentDetail";
import PaymentSubscriptionPlan from "./pages/payment/SubscriptionPlan";
import AdminSubscriptionPlan from "./pages/admin/paymentDetail/SubscrptionPlan";
import AdminContactPage from "./pages/admin/ContactUsUpadate/ContactPage";
import AdminInformationUpdate from "./pages/admin/informationUpdate/InformationUpdate";
import InformationPage from "./pages/infomationPage/InformationPage";
import QuetionAnswerPage from "./pages/quetionAnswer/QuetionAnswer";
import ProtectedRoutes from "../src/pages/registration/ProtectedRoutes";
import GalleryPage from "./pages/guessingPage/GuessingPage";
import GuessingAdminPage from "./pages/admin/guessingPage/GuessingPageAdmin";


import TablePatternInput from "./table/TablePatternInput";
// Payment Protection, AdminRoute, and StatusProtectedRoutes can remain as before if needed.
const PaymentProtectedRoutes = ({ children }) => {
  const [hasPaid, setHasPaid] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkPayment = async () => {
      if (!user?.email) {
        setHasPaid(false);
        setLoading(false);
        return;
      }
      try {
        const usersRef = collection(fireDB, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setHasPaid(
            userData.paymentDetail === "true" || userData.paymentDetail === true
          );
        } else {
          setHasPaid(false);
        }
      } catch (error) {
        console.error("Payment check error:", error);
        setHasPaid(false);
      }
      setLoading(false);
    };

    checkPayment();
  }, [user?.email]);

  if (loading) return <div>Loading payment status...</div>;
  return hasPaid ? children : <Navigate to="/payment" />;
};

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const usersRef = collection(fireDB, "users");
        const q = query(
          usersRef,
          where("email", "==", "astromathguessing@gmail.com")
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const adminData = snapshot.docs[0].data();
          const isUserAdmin = user.email === adminData.email;
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user?.email]);

  if (loading) return <div>Checking admin status...</div>;
  if (!isAdmin) return <Navigate to="/login" />;
  return children;
};

const StatusProtectedRoutes = ({ children }) => {
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkStatus = async () => {
      if (!user?.email) {
        setActive(false);
        setLoading(false);
        return;
      }
      try {
        const usersRef = collection(fireDB, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setActive(!userData.suspended);
        } else {
          setActive(false);
        }
      } catch (error) {
        console.error("Error checking account status:", error);
        setActive(false);
      }
      setLoading(false);
    };

    checkStatus();
  }, [user?.email]);

  if (loading) return <div>Checking account status...</div>;
  return active ? children : <Navigate to="/payment" />;
};

function App() {
  return (
    <MyState>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <Login />
              </>
            }
          />
          <Route
            path="/signup"
            element={
              <>
                <Navbar />
                <Signup />
              </>
            }
          />
          <Route
            path="/reset-password"
            element={
              <>
                <Navbar />
                <ForgotPassword />
              </>
            }
          />
          <Route
            path="/payment"
            element={
              <>
                <Navbar />
                <PaymentPage />
              </>
            }
          />
          <Route
            path="/subsciption-plan"
            element={
              <>
                <Navbar />
                <PaymentSubscriptionPlan />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Navbar />
                <ContactPage />
              </>
            }
          />
          <Route
            path="/information-page"
            element={
              <>
                <Navbar />
                <InformationPage />
              </>
            }
          />
          <Route
            path="/guessing-page"
            element={
              <>
                <Navbar />
                <GalleryPage />
              </>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoutes>
                <StatusProtectedRoutes>
                  <Navbar />
                  <ProfilePage />
                </StatusProtectedRoutes>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/chart-pattern-finder"
            element={
              <ProtectedRoutes>
                <StatusProtectedRoutes>
                  <Navbar />
                  <PatternInput />
                </StatusProtectedRoutes>
              </ProtectedRoutes>
            }
          />

          <Route
  path="/table-pattern-input"
  element={
    <ProtectedRoutes>
      <StatusProtectedRoutes>
        <Navbar />
        <TablePatternInput />
      </StatusProtectedRoutes>
    </ProtectedRoutes>
  }
/>

          <Route
            path="/quetion-answer"
            element={
              <>
                <Navbar />
                <QuetionAnswerPage />
              </>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <Navbar />
                <LoginDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/database-update"
            element={
              <AdminRoute>
                <Navbar />
                <DatabaseUpdate />
              </AdminRoute>
            }
          />
          <Route
            path="/live-matka-dashboard"
            element={
              <AdminRoute>
                <Navbar />
                <LiveMatkaDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/update-payemnt-detail"
            element={
              <AdminRoute>
                <Navbar />
                <AdminPaymentDetail />
                <AdminSubscriptionPlan />
              </AdminRoute>
            }
          />
          <Route
            path="/update-contact-detail"
            element={
              <AdminRoute>
                <Navbar />
                <AdminContactPage />
              </AdminRoute>
            }
          />
          <Route
            path="/update-information-detail"
            element={
              <AdminRoute>
                <Navbar />
                <AdminInformationUpdate />
              </AdminRoute>
            }
          />
          <Route
            path="/guessing-admin-page"
            element={
              <AdminRoute>
                <Navbar />
                <GuessingAdminPage />
              </AdminRoute>
            }
          />

          {/* Other Panel Routes */}
          <Route path="/kalyan-panel" element={<KalyanPanelChart />} />
          <Route path="/main-mumbai-panel" element={<MumbaiPanel />} />
          <Route path="/madhur-day-panel" element={<MadhurDayChart />} />
          <Route path="/madhur-night-panel" element={<MadhurNightChart />} />
          <Route path="/milan-day-panel" element={<MilanDayChart />} />
          <Route path="/milan-night-panel" element={<MilanNightChart />} />
          <Route path="/rajdhani-day-panel" element={<RajdhaniDayChart />} />
          <Route
            path="/rajdhani-night-panel"
            element={<RajdhaniNightChart />}
          />

          {/* 404 Route */}
          <Route path="/*" element={<NoPage />} />
        </Routes>
        <ToastContainer />
      </Router>
    </MyState>
  );
}

export default App;
