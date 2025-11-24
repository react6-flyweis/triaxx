import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { signOut } from "@/services/authHelpers";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import TriaxxLogo from "@/assets/tiaxx_logo.svg";
import UserIcon from "@/assets/navbar/profile_icon.svg";
import QuickOrderIcon from "@/assets/navbar/quick_order_icon.svg";
import TableIcon from "@/assets/navbar/table_icon.svg";
import OrderHistoryIcon from "@/assets/navbar/table_icon.svg";
import TrainingIcon from "@/assets/navbar/user2_icon.svg";
import TeamChatsIcon from "@/assets/navbar/headphone_icon.svg";
import SettingIcon from "@/assets/navbar/settings_icon.svg";
import SignOutIcon from "@/assets/navbar/logout_icon.svg";

const navItems = [
  {
    key: "sidebar.nav.quickOrder",
    icon: QuickOrderIcon,
    path: "/orders",
    className: "quick-order-btn",
  },
  {
    key: "sidebar.nav.table",
    icon: TableIcon,
    path: "/table",
    className: "table-btn",
  },
  {
    key: "sidebar.nav.orderHistory",
    icon: OrderHistoryIcon,
    path: "/order-history",
    className: "order-history-btn",
  },
];

const trainingItems = [
  {
    key: "sidebar.training.training",
    icon: TrainingIcon,
    path: "/training",
    className: "",
  },
  {
    key: "sidebar.training.teamChats",
    icon: TeamChatsIcon,
    path: "/team-chats",
    className: "team-chats-btn",
  },
];

const bottomItems = [
  {
    key: "sidebar.bottom.setting",
    icon: SettingIcon,
    path: "/settings",
    className: "settings-btn",
  },
  {
    key: "sidebar.bottom.signOut",
    icon: SignOutIcon,
    path: "/logout",
    className: "",
  },
];

interface SidebarProps {
  onLogoutClick?: () => void; // Optional prop, not used since we'll handle logout directly
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // Safe getters to avoid casting to `any` and keep strict typing
  const getField = (key: string): string | undefined =>
    user
      ? ((user as unknown as Record<string, unknown>)[key] as
          | string
          | undefined)
      : undefined;
  const { t } = useTranslation();
  const displayName = (() => {
    if (!user) return t("sidebar.user.defaultName");
    const n = getField("Name") || getField("name");
    return n || t("sidebar.user.defaultName");
  })();
  const displayRole = (() => {
    if (!user) return t("sidebar.user.defaultRole");
    const u = user as unknown as Record<string, unknown>;
    const roleObj = u["Role_id"] as Record<string, unknown> | undefined;
    if (roleObj && typeof roleObj["role_name"] === "string") {
      return roleObj["role_name"] as string;
    }
    return (u["role"] as string) || t("sidebar.user.defaultRole");
  })();
  const imageSrc = (() => {
    if (!user) return UserIcon;
    const u = user as unknown as Record<string, unknown>;
    const img = u["user_image"] as string | undefined;
    return img || UserIcon;
  })();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    signOut();
    toast.success(t("sidebar.toast.loggedOut"), {
      duration: 4000,
      position: "top-right",
    });
    navigate("/login");
  };

  const handleNavClick = (className?: string) => () => {
    if (!className) return;
    const walkthrough = useWalkthroughStore.getState();
    const step = walkthrough.steps[walkthrough.currentStep];
    if (walkthrough.isActive && step && step.selector === `.${className}`) {
      // Advance the walkthrough before letting the Link navigate
      walkthrough.next();
    }
  };

  return (
    <aside
      className="hidden lg:flex flex-col h-screen w-[250px] fixed px-6 py-8 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] items-center border-r"
      style={{ borderRightColor: "#00000033" }}
    >
      {/* Logo */}
      <div className="mb-8">
        <Link to="/">
          <img src={TriaxxLogo} alt="TRIAXX logo" className="h-6" />
        </Link>
      </div>
      {/* User */}
      <div className="flex gap-2 items-center bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-full px-4 py-2 mb-8">
        <img
          src={imageSrc}
          alt={displayName}
          className="h-8 w-8 mr-3 rounded-full object-cover"
        />
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold leading-tight">
            {displayName}
          </span>
          <span className="text-xs text-[#7c7c7c] leading-tight">
            {displayRole}
          </span>
        </div>
      </div>
      {/* Main nav */}
      <nav className="flex flex-col gap-2 mb-8">
        {navItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            onClick={handleNavClick(item.className)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-medium transition-all duration-150 ${
              isActive(item.path)
                ? "bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white"
                : "text-black hover:bg-[#f3e3ee]"
            } ${item.className}`}
          >
            <img
              src={item.icon}
              alt={t(item.key)}
              className={`h-5 w-5 ${isActive(item.path) ? "invert" : ""}`}
            />
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>
      {/* Training section */}
      <div className="mb-2 mt-2 text-xs text-[#7c7c7c] font-semibold">
        {t("sidebar.training.title")}
      </div>
      <nav className="flex flex-col gap-2 mb-8">
        {trainingItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            onClick={handleNavClick(item.className)}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-medium transition-all duration-150 ${
              isActive(item.path)
                ? "bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white"
                : "text-black hover:bg-[#f3e3ee]"
            } ${item.className}`}
          >
            <img
              src={item.icon}
              alt={t(item.key)}
              className={`h-5 w-5 ${isActive(item.path) ? "invert" : ""}`}
            />
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>
      {/* Bottom section */}
      <div className="mt-auto flex flex-col gap-2 w-full">
        {bottomItems.map((item) =>
          // use translation key to detect sign-out button
          item.key === "sidebar.bottom.signOut" ? (
            <button
              key={item.key}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-5 py-2.5 rounded-full font-medium text-black hover:bg-[#f3e3ee] transition-all duration-150"
            >
              <img src={item.icon} alt={t(item.key)} className="h-5 w-5" />
              <span>{t(item.key)}</span>
            </button>
          ) : (
            <Link
              key={item.key}
              to={item.path}
              onClick={handleNavClick(item.className)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-medium transition-all duration-150 ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white"
                  : "text-black hover:bg-[#f3e3ee]"
              } ${item.className}`}
            >
              <img
                src={item.icon}
                alt={t(item.key)}
                className={`h-5 w-5 ${isActive(item.path) ? "invert" : ""}`}
              />
              <span>{t(item.key)}</span>
            </Link>
          )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
