import React, { useState } from "react";
import accountIcon from "@/assets/setting/account_card.svg";
import notificationIcon from "@/assets/setting/Notification.svg";
import changePasswordIcon from "@/assets/setting/Unlock.svg";
import workSummaryIcon from "@/assets/setting/work_summary.svg";
import headphoneIcon from "@/assets/setting/suppport_tickets.svg";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { useEffect } from "react";

const Settings: React.FC = () => {
  const [clockedIn, setClockedIn] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isActive,
    steps,
    currentStep,
    setSettingsHighlight,
    goTo,
    next,
    settingsHighlight,
  } = useWalkthroughStore();
  const { t } = useTranslation();

  const cardData = [
    {
      icon: accountIcon,
      title: t("settings.personalInfo.title"),
      desc: t("settings.personalInfo.desc"),
      onClick: () => {
        // If walkthrough is active and on the personal info step, trigger highlight logic
        const step = steps[currentStep];
        if (isActive && step && step.selector === ".settings-personal-info") {
          setSettingsHighlight("profile");
          next(); // Advance to .profile-highlight step
        }
        navigate("/profile");
      },
    },
    {
      icon: notificationIcon,
      title: t("settings.notifications.title"),
      desc: t("settings.notifications.desc"),
      onClick: () => {
        const step = steps[currentStep];
        if (
          isActive &&
          step &&
          step.selector === ".settings-notifications" &&
          (step.advanceOn === "ui" || step.advanceOn === "both")
        ) {
          setSettingsHighlight("notifications");
          next();
        }
        navigate("/notifications");
      },
    },
    {
      icon: changePasswordIcon,
      title: t("settings.loginSecurity.title"),
      desc: t("settings.loginSecurity.desc"),
      onClick: () => {
        const step = steps[currentStep];
        if (
          isActive &&
          step &&
          step.selector === ".settings-login-security" &&
          (step.advanceOn === "ui" || step.advanceOn === "both")
        ) {
          setSettingsHighlight("security");
          next();
        }
        navigate("/profile", { state: { tab: "security" } });
      },
    },
    {
      icon: workSummaryIcon,
      title: t("settings.workSummary.title"),
      desc: t("settings.workSummary.desc"),
      onClick: () => {
        const step = steps[currentStep];
        if (
          isActive &&
          step &&
          step.selector === ".settings-work-summary" &&
          (step.advanceOn === "ui" || step.advanceOn === "both")
        ) {
          setSettingsHighlight("work");
          next();
        }
        navigate("/profile", { state: { tab: "work" } });
      },
    },
    // Clock in/out handled separately
    {
      icon: headphoneIcon,
      title: t("settings.support.title"),
      desc: t("settings.support.desc"),
      onClick: () => navigate("/settings/contact-support"),
    },
  ];

  // When returning from profile, if settingsHighlight is set (not empty), go to that step and clear it
  useEffect(() => {
    if (settingsHighlight === "notifications-reset") {
      // Find the .settings-notifications step and go to it
      const idx = steps.findIndex(
        (s) => s.selector === ".settings-notifications"
      );
      if (idx !== -1) {
        goTo(idx);
      }
      setSettingsHighlight("");
    }
  }, [settingsHighlight, steps, goTo, setSettingsHighlight]);

  return (
    <div className="p-8 min-h-screen bg-white">
      <h1 className="text-2xl font-bold mb-8">{t("settings.title")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Personal info */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-2 cursor-pointer transition hover:shadow-md settings-personal-info"
          onClick={cardData[0].onClick}
        >
          <img
            src={cardData[0].icon}
            alt={t("settings.personalInfo.title")}
            className="w-8 h-8 mb-2"
          />
          <div className="font-bold text-lg">{cardData[0].title}</div>
          <div className="text-[#00000099] text-sm">{cardData[0].desc}</div>
        </div>
        {/* Notifications */}
        <div
          className={
            `bg-white rounded-xl shadow-sm p-6 flex flex-col gap-2 cursor-pointer transition hover:shadow-md settings-notifications` +
            (isActive &&
            steps[currentStep]?.selector === ".settings-notifications" &&
            location.pathname === "/settings"
              ? " walkthrough-highlight"
              : "")
          }
          onClick={cardData[1].onClick}
        >
          <img
            src={cardData[1].icon}
            alt={t("settings.notifications.title")}
            className="w-8 h-8 mb-2"
          />
          <div className="font-bold text-lg">{cardData[1].title}</div>
          <div className="text-[#00000099] text-sm">{cardData[1].desc}</div>
        </div>
        {/* Login & Security */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-2 cursor-pointer transition hover:shadow-md settings-login-security"
          onClick={cardData[2].onClick}
        >
          <img
            src={cardData[2].icon}
            alt={t("settings.loginSecurity.title")}
            className="w-8 h-8 mb-2"
          />
          <div className="font-bold text-lg">{cardData[2].title}</div>
          <div className="text-[#00000099] text-sm">{cardData[2].desc}</div>
        </div>
        {/* Work Summary */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-2 cursor-pointer transition hover:shadow-md settings-work-summary"
          onClick={cardData[3].onClick}
        >
          <img
            src={cardData[3].icon}
            alt={t("settings.workSummary.title")}
            className="w-8 h-8 mb-2"
          />
          <div className="font-bold text-lg">{cardData[3].title}</div>
          <div className="text-[#00000099] text-sm">{cardData[3].desc}</div>
        </div>
        {/* Clock in/out with toggle */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-2 cursor-pointer transition hover:shadow-md "
          onClick={() => navigate("/settings/clock-in-out")}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={` w-16 h-8 flex items-center rounded-full transition-colors duration-200 shadow p-2 settings-clock-in-out '}`}
              style={{ minWidth: 48 }}
              onClick={(e) => {
                e.stopPropagation();
                setClockedIn((v) => !v);
              }}
            >
              <div
                className={`w-6 h-6 rounded-full shadow transform transition-transform duration-200 flex items-center justify-center text-xs font-bold   ${
                  clockedIn
                    ? "translate-x-6 bg-primary-gradient text-white "
                    : "translate-x-0 bg-primary-gradient-light  text-black "
                }`}
              >
                {!clockedIn ? t("settings.clock.off") : t("settings.clock.on")}
              </div>
            </div>
          </div>
          <div className="font-bold text-lg">{t("settings.clock.title")}</div>
          <div className="text-[#00000099] text-sm">
            {t("settings.clock.desc")}
          </div>
        </div>
        {/* Support Tickets */}
        <div
          className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-2 cursor-pointer transition hover:shadow-md settings-contact-support"
          onClick={() => {
            // Walkthrough logic
            const step = steps[currentStep];
            if (
              isActive &&
              step &&
              step.selector === ".settings-contact-support"
            ) {
              setSettingsHighlight("contact-support");
              next();
            }
            navigate("/settings/contact-support");
          }}
        >
          <img
            src={cardData[4].icon}
            alt={t("settings.support.title")}
            className="w-8 h-8 mb-2"
          />
          <div className="font-bold text-lg">{cardData[4].title}</div>
          <div className="text-[#00000099] text-sm">{cardData[4].desc}</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
