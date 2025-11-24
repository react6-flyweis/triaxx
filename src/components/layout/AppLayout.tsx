import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNavBar from "./MobileNavBar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import LogoutModal from "../common/LogoutModal";
import SignOutSuccessModal from "../common/SignOutSuccessModal";
import Header from "./Header";
import MobileLogoutConfirmation from "../common/MobileLogoutConfirmation";
import MobileLogoutSuccess from "../common/MobileLogoutSuccess";
import { signOut } from "@/services/authHelpers";

const mobileRoutes = [
  "/orders",
  "/table",
  "/chats",
  "/profile",
  "/notifications",
  "/team-chats",
];

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1023px)");
  // Desktop modal states
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  // Mobile modal states
  const [isMobileConfirmOpen, setMobileConfirmOpen] = useState(false);
  const [isMobileSuccessOpen, setMobileSuccessOpen] = useState(false);
  const logout = () => {
    signOut();
  };

  useEffect(() => {
    // If on mobile and current route is not a valid mobile route, redirect to /orders
    if (
      isMobile &&
      !mobileRoutes.some((route) => location.pathname.startsWith(route))
    ) {
      navigate("/orders", { replace: true });
    }
  }, [location, isMobile, navigate]);

  const handleOpenLogoutModal = () => {
    if (isMobile) {
      setMobileConfirmOpen(true);
    } else {
      setLogoutModalOpen(true);
    }
  };

  // --- Desktop Handlers ---
  const handleCloseLogoutModal = () => {
    setLogoutModalOpen(false);
  };

  const handleConfirmLogout = () => {
    // Close confirmation modal, open success modal
    setLogoutModalOpen(false);
    setSuccessModalOpen(true);

    // Wait 2 seconds, then close success modal and navigate
    setTimeout(() => {
      setSuccessModalOpen(false);
      logout(); // Perform the actual sign-out
    }, 2000);
  };

  // --- Mobile Handlers ---
  const handleCloseMobileConfirm = () => {
    setMobileConfirmOpen(false);
  };

  const handleConfirmMobileLogout = () => {
    setMobileConfirmOpen(false);
    setMobileSuccessOpen(true);
  };

  const handleContinueFromSuccess = () => {
    setMobileSuccessOpen(false);
    logout();
  };
  return (
    <div className="flex bg-gray-50">
      <Sidebar onLogoutClick={handleOpenLogoutModal} />
      <Header />
      <main className="flex flex-col max-w-screen w-full min-h-0 lg:pt-28 lg:pl-[250px]">
        <Outlet />
      </main>
      <MobileNavBar />
      {/* Desktop Modals */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
        onConfirm={handleConfirmLogout}
      />
      <SignOutSuccessModal isOpen={isSuccessModalOpen} />
      {/* Mobile Modals */}
      <MobileLogoutConfirmation
        isOpen={isMobileConfirmOpen}
        onClose={handleCloseMobileConfirm}
        onConfirm={handleConfirmMobileLogout}
      />
      <MobileLogoutSuccess
        isOpen={isMobileSuccessOpen}
        onContinue={handleContinueFromSuccess}
      />
    </div>
  );
};

export default AppLayout;
