import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HamburgerIcon from "@/assets/navbar/hamburger_menu.svg";
import SearchIcon from "@/assets/navbar/search_icon.svg";
import LanguageSelector from "@/components/common/LanguageSelector";
import NotificationIcon from "@/assets/header/notification_icon.svg";
import { useWalkthroughStore } from "@/store/walkthroughStore";
// Using a placeholder for the user avatar, as it would likely be dynamic
// import UserAvatar from '@/assets/navbar/profile_icon.svg';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-[250px] right-0 z-50 hidden lg:flex items-center justify-between px-8 py-8 bg-white border-r border-[#00000033] shadow-[0px_9px_26px_0px_#0000000D]">
      {/* Left side: Search bar */}
      <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] w-full max-w-sm">
        <img src={HamburgerIcon} alt="Menu" className="h-5 w-5 text-gray-500" />
        <input
          type="text"
          placeholder={t("header.search")}
          className="bg-transparent focus:outline-none w-full text-gray-800 placeholder-gray-500 font-medium"
        />
        <img
          src={SearchIcon}
          alt={t("header.search")}
          className="h-5 w-5 text-gray-500"
        />
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-4">
        {/* Language Dropdown */}
        <LanguageSelector />

        {/* Notification Icon */}
        <div
          className="relative cursor-pointer p-2"
          onClick={() => navigate("/notifications")}
        >
          <img
            src={NotificationIcon}
            alt={t("header.notifications")}
            className="h-6 w-6"
          />
          <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">
            <span className="absolute -top-px">3</span>
          </div>
        </div>

        {/* User Profile */}
        <div
          className="profile-btn flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] cursor-pointer"
          onClick={() => {
            useWalkthroughStore.getState().next();
            navigate("/profile");
          }}
        >
          <img
            src={user?.user_image}
            alt="User Avatar"
            className="h-8 w-8 rounded-full bg-white p-1"
          />
          <span className="font-medium">
            {user?.Name ?? t("sidebar.user.defaultName")}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
