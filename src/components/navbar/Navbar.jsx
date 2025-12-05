import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { collection, query, where, getDocs } from "firebase/firestore";
import { fireDB } from "../../firebase/FirebaseConfig";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        return;
      }
      try {
        const usersRef = collection(fireDB, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setIsAdmin(userData.email === "astromathguessing@gmail.com");
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Admin check error:", error);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user?.email]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleAdminNavigation = (path) => {
    setAdminDropdown(false);
    setOpen(false);
    navigate(path);
  };

  // Mobile sidebar for smaller devices
  const MobileSidebar = () => (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-col bg-white pb-12 shadow-xl">
              <div className="flex items-center justify-between px-4 pt-5 pb-2">
                <Link to="/" className="flex" onClick={() => setOpen(false)}>
                  <h1 className="text-xl font-bold text-[#a30d6c]">
                    Matka Trick Search
                  </h1>
                </Link>
                <button
                  type="button"
                  className="h-10 w-10 flex items-center justify-center rounded-md"
                  onClick={() => setOpen(false)}
                >
                  <RxCross2 className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-4 space-y-2 px-4">
                <Link
                  to="/"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/chart-pattern-finder"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Chart Pattern Finder
                </Link>


                <Link
  to="/table-pattern-input"
  className="block px-4 py-2 hover:bg-gray-100"
  onClick={() => setOpen(false)}
>
  Table Pattern Input
</Link>



                <Link
                  to="/guessing-page"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Top Guessing Tricks
                </Link>
                <Link
                  to="/payment"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Payment
                </Link>
                {user && (
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Profile
                  </Link>
                )}
                <Link
                  to="/quetion-answer"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Info
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                >
                  Contact Us
                </Link>
                {isAdmin && (
                  <div className="px-4">
                    <button
                      onClick={() => setAdminDropdown(!adminDropdown)}
                      className="w-full text-left py-2 hover:bg-gray-100"
                    >
                      Admin ▼
                    </button>
                    {adminDropdown && (
                      <div className="pl-4 mt-1 space-y-1">
                        <button
                          onClick={() => handleAdminNavigation("/dashboard")}
                          className="block w-full text-left py-1 hover:bg-gray-100"
                        >
                          Payment Dashboard
                        </button>
                        <button
                          onClick={() =>
                            handleAdminNavigation("/database-update")
                          }
                          className="block w-full text-left py-1 hover:bg-gray-100"
                        >
                          Database Chart Update
                        </button>
                        <button
                          onClick={() =>
                            handleAdminNavigation("/live-matka-dashboard")
                          }
                          className="block w-full text-left py-1 hover:bg-gray-100"
                        >
                          Live Result Dashboard
                        </button>
                        <button
                          onClick={() =>
                            handleAdminNavigation("/update-payemnt-detail")
                          }
                          className="block w-full text-left py-1 hover:bg-gray-100"
                        >
                          Update Payment Detail
                        </button>
                        <button
                          onClick={() =>
                            handleAdminNavigation("/update-contact-detail")
                          }
                          className="block w-full text-left py-1 hover:bg-gray-100"
                        >
                          Update Contact Detail
                        </button>
                        <button
                          onClick={() =>
                            handleAdminNavigation("/guessing-admin-page")
                          }
                          className="block w-full text-left py-1 hover:bg-gray-100"
                        >
                          Update Guessing Page
                        </button>
                        <button
                          onClick={() =>
                            handleAdminNavigation("/update-information-detail")
                          }
                          className="block w-full text-left py-1 hover:bg-gray-100"
                        >
                          Update Information Video Detail
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 border-t px-4 pt-4">
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="block w-full text-left py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block py-2 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block py-2 hover:bg-gray-100"
                      onClick={() => setOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );

  // Desktop navbar for larger screens
  const DesktopNavbar = () => (
    <div className="max-auto mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        {/* Left: Logo and navigation links */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-bold text-[#a30d6c]">
            Matka Trick Search
          </Link>
          <Link to="/" className="hover:text-gray-800">
            Home
          </Link>
          <Link to="/chart-pattern-finder" className="hover:text-gray-800">
            Chart Pattern Finder
          </Link>
          <Link to="/table-pattern-input" className="hover:text-gray-800">
  Table Pattern Input
</Link>

          <Link to="/guessing-page" className="hover:text-gray-800">
            Top Guessing Tricks
          </Link>
          <Link to="/payment" className="hover:text-gray-800">
            Payment
          </Link>
          {user && (
            <Link to="/profile" className="hover:text-gray-800">
              Profile
            </Link>
          )}
          <Link to="/quetion-answer" className="hover:text-gray-800">
            Info
          </Link>
          <Link to="/contact" className="hover:text-gray-800">
            Contact Us
          </Link>
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setAdminDropdown(!adminDropdown)}
                className="hover:text-gray-800 focus:outline-none"
              >
                Admin ▼
              </button>
              {adminDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10">
                  <button
                    onClick={() => handleAdminNavigation("/dashboard")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Payment Dashboard
                  </button>
                  <button
                    onClick={() => handleAdminNavigation("/database-update")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Database Chart Update
                  </button>
                  <button
                    onClick={() =>
                      handleAdminNavigation("/live-matka-dashboard")
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Live Result Dashboard
                  </button>
                  <button
                    onClick={() =>
                      handleAdminNavigation("/update-payemnt-detail")
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Update Payment Detail
                  </button>
                  <button
                    onClick={() =>
                      handleAdminNavigation("/update-contact-detail")
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Update Contact Detail
                  </button>
                  <button
                    onClick={() =>
                      handleAdminNavigation("/guessing-admin-page")
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Update Guessing Page
                  </button>

                  <button
                    onClick={() =>
                      handleAdminNavigation("/update-information-detail")
                    }
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Update Information Video Detail
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Right: Auth links */}
        <div className="flex items-center space-x-4">
          {user ? (
            <button
              onClick={logout}
              className="text-sm font-medium hover:text-gray-800"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium hover:text-gray-800"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium hover:text-gray-800"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white">
      <MobileSidebar />
      <header className="bg-white shadow">
        {/* Mobile Header */}
        <div className="lg:hidden">
          <div className="flex items-center h-16 px-4">
            <button onClick={() => setOpen(true)} className="p-2 text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            <Link to="/" className="text-xl font-bold text-[#a30d6c]">
              Matka Trick Search
            </Link>
          </div>
        </div>
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <DesktopNavbar />
        </div>
      </header>
    </div>
  );
}
