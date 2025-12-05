// ProtectedRoutes.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";

const ProtectedRoutes = ({ children }) => {
  const localUser = JSON.parse(localStorage.getItem("user"));
  const [serverUser, setServerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // When forceLogout becomes true, we trigger redirection.
  const [forceLogout, setForceLogout] = useState(false);

  useEffect(() => {
    if (!localUser || !localUser.email) {
      setLoading(false);
      return;
    }
    const usersRef = collection(fireDB, "users");
    const q = query(usersRef, where("email", "==", localUser.email));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const fetchedUser = snapshot.docs[0].data();
          setServerUser(fetchedUser);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [localUser?.email]);

  useEffect(() => {
    // When loading is complete and tokens mismatch, show toast and trigger logout.
    if (
      !loading &&
      localUser &&
      serverUser &&
      localUser.sessionToken !== serverUser.sessionToken &&
      !forceLogout
    ) {
      toast.info(
        "You have logged in on another device. This session has been logged out. Do not share your User ID and password with anyone."
      );
      const timer = setTimeout(() => {
        localStorage.removeItem("user");
        setForceLogout(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, localUser, serverUser, forceLogout]);

  if (loading) return <div>Loading...</div>;

  // If no user exists or tokens mismatch (and logout triggered), redirect to login.
  if (
    !localUser ||
    !serverUser ||
    localUser.sessionToken !== serverUser.sessionToken
  ) {
    if (forceLogout) {
      return <Navigate to="/login" />;
    }
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoutes;
