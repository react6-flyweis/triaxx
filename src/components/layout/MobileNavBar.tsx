import React from "react";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { Link, useLocation } from "react-router-dom";

// Import mobile navigation icons
import QuickOrderIcon from "@/assets/navbar/quick_order_icon.svg";
import TableIcon from "@/assets/navbar/table_icon.svg";
import ChatsIcon from "@/assets/navbar/headphone_icon.svg";
import ProfileIcon from "@/assets/navbar/profile_icon.svg";

const navItems = [
  {
    name: "Orders",
    path: "/orders",
    icon: QuickOrderIcon,
    className: "quick-order-btn",
  },
  { name: "Table", path: "/table", icon: TableIcon, className: "table-btn" },
  {
    name: "Chats",
    path: "/team-chats",
    icon: ChatsIcon,
    className: "team-chats-btn",
  },
  {
    name: "Profile",
    path: "/profile",
    icon: ProfileIcon,
    className: "profile-btn",
  },
];

const MobileNavBar: React.FC = () => {
  const location = useLocation();
  const handleNavClick = (className?: string) => () => {
    if (!className) return;
    const walkthrough = useWalkthroughStore.getState();
    const step = walkthrough.steps[walkthrough.currentStep];
    if (walkthrough.isActive && step && step.selector === `.${className}`) {
      walkthrough.next();
    }
  };

  // Hide navbar on profile page
  if (location.pathname.startsWith("/profile")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 py-1.5 bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)] lg:hidden flex justify-around items-center px-4 z-40">
      {navItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path);
        return (
          <Link
            to={item.path}
            key={item.name}
            onClick={handleNavClick(item.className)}
            className="flex flex-col items-center justify-center w-1/4"
          >
            <img
              src={item.icon}
              alt={item.name}
              className={`w-6 h-6 mb-1 ${
                isActive
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]"
                  : "text-gray-500"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                isActive
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]"
                  : "text-gray-500"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNavBar;
