import { useState, useRef, useEffect } from "react";
import userIcon from "@/assets/profile/user.svg";
import accountIcon from "@/assets/profile/account_icon.svg";
import emailIcon from "@/assets/profile/email_icon.svg";
import callIcon from "@/assets/profile/call_icon.svg";
import rolesIcon from "@/assets/profile/user_role.svg";
import employeeTrainingIcon from "@/assets/profile/employee_training_icon.svg";
import personalDataIcon from "@/assets/profile/personal_data_icon.svg";
import workSummaryIcon from "@/assets/profile/work_summary.svg";
import changePasswordIcon from "@/assets/profile/change_password.svg";
import notificationIcon from "@/assets/profile/notification_light.svg";
import notificationIconFilled from "@/assets/profile/notification.svg";
import logoutIcon from "@/assets/profile/logout.svg";
import clockIcon from "@/assets/profile/clock_icon.svg";
import backIcon from "@/assets/back.svg";
import rightTick from "@/assets/profile/right_tick.svg";
import rightArrow from "@/assets/profile/arrow-right.svg";
import WorkSummary from "./WorkSummary";
import refreshIcon from "@/assets/profile/refresh.svg";
import userIconLight from "@/assets/profile/user.svg";
import { useChangePasswordMutation } from "@/redux/api/userApi";
import employeeIcon from "@/assets/profile/personal_data_icon.svg";
import lockIcon from "@/assets/profile/finger-scan.svg";
import eyeIcon from "@/assets/eye_icon.svg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWalkthroughStore } from "@/store/walkthroughStore";

interface User {
  _id: string;
  Name: string;
  Responsibility_id: {
    Responsibility_id: number;
    Responsibility_name: string;
  };
  Role_id: {
    Role_id: number;
    role_name: string;
  };
  Employee_id: string;
  email: string;
  phone: string;
  user_image: string;
  OnboardingDate: string;
  yearsWithus: number;
}

interface ProfileMobileProps {
  forceSecurityTab?: boolean;
  forceWorkTab?: boolean;
  user?: User;
}

const PersonalMobile = ({
  onBack,
  user,
}: {
  onBack: () => void;
  user?: User;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="w-full min-h-screen bg-[#F9F6FB] pb-8">
      <div
        className="relative w-full h-20"
        style={{
          background: "linear-gradient(90deg, #D32F2F 0%, #6A1B9A 100%)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-6">
          <div className="flex gap-4">
            <button className="text-white text-2xl" onClick={onBack}>
              <img src={backIcon} alt={t("profile.back")} />
            </button>
            <span className="text-white text-2xl font-bold text-left">
              {t("profile.infoTitle")}
            </span>
          </div>
          <img
            src={notificationIcon}
            alt={t("profile.notificationsAlt")}
            className="w-8 h-8"
            onClick={() => navigate("/notifications")}
          />
        </div>
      </div>

      <div className="px-4 mt-8">
        <div className="font-semibold text-base mt-2">
          {t("profile.personalDataTitle")}
        </div>
        <div className="text-xs text-[#00000099] mb-4">
          {t("profile.personalDataSubtitle")}
        </div>
        <div className="flex flex-col items-center mb-2">
          <div className="relative">
            <img
              src={user?.user_image}
              alt={t("profile.avatarAlt")}
              className="w-20 h-20 rounded-xl border-2 border-white object-cover bg-white"
            />
            <span className="absolute -top-2 -right-2 bg-[#F8E6EF] rounded-full p-1 border border-white">
              <img
                src={refreshIcon}
                alt={t("profile.editAlt")}
                className="w-5 h-5 bg-purple-500 p-0.5 rounded-full"
              />
            </span>
          </div>
          <div className="text-lg font-bold mt-2">{user?.Name}</div>
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-600">
            {t("profile.labels.name")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img
                src={userIconLight}
                alt={t("profile.userIconAlt")}
                className="w-5 h-5"
              />
            </span>
            <input
              className="rounded-lg border border-[#E0E0E0] pl-10 pr-2 py-2 bg-white w-full"
              value={user?.Name}
              readOnly
            />
          </div>
          <label className="text-xs font-semibold text-gray-600">
            {t("profile.labels.email")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img
                src={emailIcon}
                alt={t("profile.emailIconAlt")}
                className="w-5 h-5"
              />
            </span>
            <input
              className="rounded-lg border border-[#E0E0E0] pl-10 pr-2 py-2 bg-white w-full"
              value={user?.email}
              readOnly
            />
          </div>
          <label className="text-xs font-semibold text-gray-600">
            {t("profile.labels.phone")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img
                src={callIcon}
                alt={t("profile.phoneIconAlt")}
                className="w-5 h-5"
              />
            </span>
            <input
              className="rounded-lg border border-[#E0E0E0] pl-10 pr-2 py-2 bg-white w-full"
              value={user?.phone}
              readOnly
            />
          </div>
          <label className="text-xs font-semibold text-gray-600">
            {t("profile.labels.employeeId")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img
                src={employeeIcon}
                alt={t("profile.empIdIconAlt")}
                className="w-5 h-5"
              />
            </span>
            <input
              className="rounded-lg border border-[#E0E0E0] pl-10 pr-2 py-2 bg-white w-full"
              value={user?.Employee_id}
              readOnly
            />
          </div>
          <label className="text-xs font-semibold text-gray-600">
            {t("profile.labels.role")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img
                src={rolesIcon}
                alt={t("profile.roleIconAlt")}
                className="w-5 h-5"
              />
            </span>
            <input
              className="rounded-lg border border-[#E0E0E0] pl-10 pr-2 py-2 bg-white w-full"
              value={user?.Role_id.role_name}
              readOnly
            />
          </div>
        </div>
        <div className="font-semibold text-base mt-6">
          {t("profile.workDetails")}
        </div>
        <div className="text-xs text-[#00000099] mb-4">
          {t("profile.workDetailsSubtitle")}
        </div>
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-[#00000099]">
            {t("profile.labels.onboardingDate")}
          </label>
          <input
            className="rounded-lg border border-[#E0E0E0] px-4 py-2 bg-white"
            value={user?.OnboardingDate}
            readOnly
          />
          <label className="text-xs font-semibold text-[#00000099]">
            {t("profile.labels.yearsWithUs")}
          </label>
          <input
            className="rounded-lg border border-[#E0E0E0] px-4 py-2 bg-white"
            value={`${user?.yearsWithus} ${t("profile.yearsSuffix")}`}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

const OtpSentModal = ({
  email,
  onVerify,
}: {
  email: string;
  onVerify: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-t-2xl shadow-xl p-6 w-full max-w-md animate-bottom-sheet-in flex flex-col items-center mb-0">
        <div className="font-bold text-lg mb-1 text-center">
          {t("auth.otpSent.title")}
        </div>
        <div className="text-xs text-[#00000099] mb-2 text-center">
          {t("auth.otpSent.body")}
        </div>
        <div className="font-semibold text-base mb-4 text-center">{email}</div>
        <button
          className="w-full py-2 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]"
          onClick={onVerify}
        >
          {t("auth.verify.submit")}
        </button>
      </div>
    </div>
  );
};

const OtpInputModal = ({
  onContinue,
}: {
  onContinue: (otp: string) => void;
}) => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-t-2xl shadow-xl p-6 w-full max-w-md animate-bottom-sheet-in flex flex-col items-center mb-0">
        <div className="font-bold text-lg mb-1 text-center">
          {t("auth.verify.submit")}
        </div>
        <div className="text-xs text-[#00000099] mb-4 text-center">
          {t("auth.verify.instructions")}
        </div>
        <label className="w-full text-left text-sm font-semibold mb-1">
          {t("auth.verify.label")}
        </label>
        <input
          ref={inputRef}
          className="rounded-lg border border-[#E0E0E0] px-4 py-2 w-full mb-4 text-center"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder={t("auth.verify.placeholder")}
        />
        <button
          className="w-full py-2 rounded-xl text-white font-semibold text-base bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]"
          onClick={() => onContinue(otp)}
          disabled={!otp}
        >
          {t("actions.continue")}
        </button>
      </div>
    </div>
  );
};

const ChangePasswordMobile = ({
  onBack,
  user,
}: {
  onBack: () => void;
  user?: User;
}) => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const canSave =
    currentPassword && newPassword && newPassword === confirmPassword;
  const navigate = useNavigate();
  const [showOtpSent, setShowOtpSent] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const handleUpdatePassword = async () => {
    if (!canSave) {
      return;
    }

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      alert(result.message || "Password changed successfully!");

      // Clear form and go back
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onBack();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      alert(err.data?.message || err.message || "Failed to change password");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F9F6FB] pb-8">
      <div
        className="relative w-full h-20"
        style={{
          background: "linear-gradient(90deg, #D32F2F 0%, #6A1B9A 100%)",
        }}
      >
        <div className="flex items-center justify-between px-4 pt-6">
          <div className="flex gap-4">
            <button className="text-white text-2xl" onClick={onBack}>
              <img src={backIcon} alt="back" />
            </button>
            <span className="text-white text-2xl font-bold text-left">
              {t("profile.changePasswordTitle")}
            </span>
          </div>
          <img
            src={notificationIcon}
            alt="notif"
            className="w-8 h-8"
            onClick={() => navigate("/notifications")}
          />
        </div>
      </div>
      <div className="px-4 mt-6">
        <div className="font-semibold text-lg mb-1 mt-2">
          {t("profile.changePasswordTitle")}
        </div>
        <div className="text-xs text-[#00000099] mb-4">
          {t("profile.changePasswordInfo")}
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-semibold text-[#222]">
              {t("profile.enterCurrentPassword")}
            </label>
            <button
              className="text-xs font-semibold text-[#D32F2F]"
              onClick={() => setShowOtpSent(true)}
            >
              {t("profile.forgetPassword")}
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img src={lockIcon} alt="lock" className="w-5 h-5" />
            </span>
            <input
              type={showCurrent ? "text" : "password"}
              className="rounded-lg border border-[#E0E0E0] pl-10 pr-10 py-2 bg-white w-full"
              placeholder={t("profile.passwordPlaceholder")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowCurrent((v) => !v)}
            >
              <img src={eyeIcon} alt="Show" className="w-5 h-5" />
            </span>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-semibold text-[#222] mb-1">
            {t("profile.enterNewPassword")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img src={lockIcon} alt="lock" className="w-5 h-5" />
            </span>
            <input
              type={showNew ? "text" : "password"}
              className="rounded-lg border border-[#E0E0E0] pl-10 pr-10 py-2 bg-white w-full"
              placeholder={t("profile.passwordPlaceholder")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowNew((v) => !v)}
            >
              <img src={eyeIcon} alt="Show" className="w-5 h-5" />
            </span>
          </div>
        </div>
        <div className="mb-8">
          <label className="text-sm font-semibold text-[#222] mb-1">
            {t("profile.reenterNewPassword")}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <img src={lockIcon} alt="lock" className="w-5 h-5" />
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              className="rounded-lg border border-[#E0E0E0] pl-10 pr-10 py-2 bg-white w-full"
              placeholder={t("profile.passwordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowConfirm((v) => !v)}
            >
              <img src={eyeIcon} alt="Show" className="w-5 h-5" />
            </span>
          </div>
        </div>
        <button
          className="w-full py-3 rounded-xl text-white font-semibold text-lg bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] disabled:opacity-50"
          disabled={!canSave || isChangingPassword}
          onClick={handleUpdatePassword}
        >
          {isChangingPassword
            ? t("profile.updating")
            : t("profile.updatePassword")}
        </button>
      </div>
      {showOtpSent && (
        <OtpSentModal
          email={user?.email ?? ""}
          onVerify={() => {
            setShowOtpSent(false);
            setShowOtpInput(true);
          }}
        />
      )}
      {showOtpInput && (
        <OtpInputModal
          onContinue={() => {
            setShowOtpInput(false);
            onBack();
          }}
        />
      )}
    </div>
  );
};

export const ProfileMobile: React.FC<ProfileMobileProps> = ({
  forceSecurityTab,
  forceWorkTab,
  user,
}) => {
  const { isActive, activeTraining, steps, currentStep, complete } =
    useWalkthroughStore();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<
    | null
    | "work"
    | "personal"
    | "security"
    | "sign-out"
    | "OrderHistory"
    | "Personal"
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTraining !== "profile") {
      if (forceSecurityTab && selectedTab !== "security") {
        setSelectedTab("security");
      } else if (forceWorkTab && selectedTab !== "work") {
        setSelectedTab("work");
      }
    }
  }, [forceSecurityTab, forceWorkTab, selectedTab, activeTraining]);

  useEffect(() => {
    if (isActive && activeTraining === "profile") {
      if (
        steps[currentStep]?.selector === ".profile-work-tab" &&
        selectedTab !== "work"
      ) {
        setSelectedTab("work");
      } else if (
        steps[currentStep]?.selector === ".profile-personal-tab" &&
        selectedTab !== "personal"
      ) {
        setSelectedTab("personal");
      } else if (
        steps[currentStep]?.selector === ".profile-security-tab" &&
        selectedTab !== "security"
      ) {
        setSelectedTab("security");
      } else if (
        steps[currentStep]?.selector === ".profile-sign-out-tab" &&
        selectedTab !== "sign-out"
      ) {
        setSelectedTab("sign-out");
      }
    }
    if (
      isActive &&
      activeTraining === "profile" &&
      steps[currentStep]?.selector === ".profile-sign-out-tab"
    ) {
      setTimeout(() => {
        complete();
        navigate("/training");
      }, 800);
    }
  }, [
    isActive,
    activeTraining,
    steps,
    currentStep,
    complete,
    navigate,
    selectedTab,
  ]);

  const [showWorkSummary, setShowWorkSummary] = useState(false);
  const [showPersonalMobile, setShowPersonalMobile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (showWorkSummary) {
    return <WorkSummary layout="mobile" />;
  }

  if (showPersonalMobile) {
    return (
      <PersonalMobile onBack={() => setShowPersonalMobile(false)} user={user} />
    );
  }

  if (showChangePassword) {
    return (
      <ChangePasswordMobile
        onBack={() => setShowChangePassword(false)}
        user={user}
      />
    );
  }

  return (
    <div className={`w-full min-h-screen bg-[#F9F6FB] pb-8 profile-highlight`}>
      <div
        className="relative w-full h-32"
        style={{
          background: "linear-gradient(90deg, #D32F2F 0%, #6A1B9A 100%)",
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <button className="text-white text-2xl" onClick={() => navigate(-1)}>
            <img src={backIcon} alt={t("itemDetails.back")} />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={accountIcon}
              alt={t("profile.avatarAlt")}
              className="w-6 h-6"
            />
            <span className="text-white text-2xl font-bold">
              {t("profile.title")}
            </span>
          </div>
          <div className="w-6" />
        </div>
        <div className="absolute left-1/2 top-30 transform -translate-x-1/2 -translate-y-1/2">
          <img
            src={user?.user_image}
            alt={t("profile.avatarAlt")}
            className="w-20 h-20 rounded-xl border-2 border-white object-cover bg-white"
          />
        </div>
      </div>
      <div className="flex flex-col items-center mt-12">
        <span className="text-xl font-bold text-[#0B0B0B]">{user?.Name}</span>
        <span className="text-[#0B0B0B] font-normal text-sm flex items-center gap-1">
          {user?.Role_id.role_name}
          <span className="ml-1 w-4 h-4 inline-block align-middle">
            <img src={rightTick} alt="rightTick" />
          </span>
        </span>
        <button
          className="mt-3 flex items-center gap-2 px-6 py-2 rounded-xl text-white font-semibold text-base shadow-md cursor-pointer"
          style={{
            background: "linear-gradient(360deg, #D32F2F 0%, #6A1B9A 100%)",
          }}
        >
          {t("profile.clockIn")}
          <img
            src={clockIcon}
            alt={t("profile.clockIconAlt")}
            className="w-5 h-5"
          />
        </button>
      </div>
      <div className="flex justify-center mt-6 px-2">
        <div className="flex w-full bg-[#F8EAEE] rounded-lg p-1">
          <button
            className={`flex-1 py-1 rounded-lg text-lg font-bold transition-all duration-200 ${
              selectedTab === "OrderHistory" ? "text-white" : "text-[#0000004D]"
            }`}
            style={
              selectedTab === "OrderHistory"
                ? {
                    background:
                      "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)",
                  }
                : {}
            }
            onClick={() => setSelectedTab("OrderHistory")}
          >
            {t("sidebar.nav.orderHistory")}
          </button>
          <button
            className={`flex-1 py-1 rounded-lg text-lg font-bold transition-all duration-200 ${
              selectedTab === "Personal" ? "text-white" : "text-[#0000004D]"
            }`}
            style={
              selectedTab === "Personal"
                ? {
                    background:
                      "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)",
                  }
                : {}
            }
            onClick={() => setSelectedTab("Personal")}
          >
            {t("profile.personal") || "Personal"}
          </button>
        </div>
      </div>
      <div className="mt-6 px-4">
        <div className="flex justify-between">
          <div className="font-semibold text-base text-[#000] mb-2">
            {t("profile.infoTitle")}
          </div>
          <img
            src={rightArrow}
            alt="rightArrow"
            onClick={() => setShowPersonalMobile(true)}
          />
        </div>
        <div className="rounded-xl bg-[#F8EAEE] p-4 flex flex-col gap-6">
          <div className="flex items-center gap-6 text-[#6A1B9A]">
            <img src={emailIcon} alt="email" className="w-5 h-5" />
            <span className="text-sm text-[#00000099]">{user?.email}</span>
          </div>
          <div className="flex items-center gap-6 text-[#6A1B9A]">
            <img src={userIcon} alt="empid" className="w-5 h-5" />
            <span className="text-sm text-[#00000099]">
              {t("profile.empLabel", { id: user?.Employee_id })}
            </span>
          </div>
          <div className="flex items-center gap-6 text-[#6A1B9A]">
            <img src={callIcon} alt="phone" className="w-5 h-5" />
            <span className="text-sm text-[#00000099]">{user?.phone}</span>
          </div>
          <div
            className="flex items-center justify-between"
            onClick={() => setShowPersonalMobile(true)}
          >
            <div className="flex items-center gap-6 text-[#6A1B9A]">
              <img
                src={rolesIcon}
                alt={t("profile.roleIconAlt")}
                className="w-5 h-5"
              />
              <span className="text-sm text-[#00000099]">
                {user?.Responsibility_id?.Responsibility_name}
              </span>
            </div>
            <img src={rightArrow} alt="rightArrow" />
          </div>
          <div className="mt-6 px-4">
            <div className="font-semibold text-base text-[#1E1E1E] mb-2">
              {t("training.title")}
            </div>
            <div className="rounded-xl bg-[#F8E6EF] p-4 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-[#6A1B9A]">
                <img
                  src={employeeTrainingIcon}
                  alt="training"
                  className="w-5 h-5"
                />
                <span className="text-sm text-[#00000099]">
                  {t("profile.employeeTraining")}
                </span>
              </div>
              <img src={rightArrow} onClick={() => {}} alt="rightArrow" />
            </div>
          </div>
          <div className="mt-6 px-4">
            <div className="font-semibold text-base mb-2">
              {t("profile.account")}
            </div>
            <div className="flex flex-col rounded-lg bg-[#F8E6EF]">
              <div
                className="rounded-xl p-4 flex items-center justify-between gap-6"
                onClick={() => setShowPersonalMobile(true)}
              >
                <div className="flex items-center gap-6 text-[#6A1B9A]">
                  <img
                    src={personalDataIcon}
                    alt="work summary"
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-[#00000099]">
                    {t("profile.personalDataTitle")}
                  </span>
                </div>
                <img src={rightArrow} alt="rightArrow" />
              </div>
              <div
                className="rounded-xl p-4 flex items-center justify-between gap-6"
                onClick={() => setShowWorkSummary(true)}
              >
                <div className="flex items-center gap-6 text-[#6A1B9A]">
                  <img
                    src={workSummaryIcon}
                    alt="work summary"
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-[#00000099]">
                    {t("workSummary.title")}
                  </span>
                </div>
                <img src={rightArrow} alt="rightArrow" />
              </div>
            </div>
          </div>
          <div className="mt-6 px-4">
            <div className="font-semibold text-base text-[#1E1E1E] mb-2">
              {t("settings.title")}
            </div>
            <div className="rounded-xl bg-[#F8E6EF] p-4 flex flex-col gap-6">
              <div
                className="flex items-center gap-6"
                onClick={() => setShowChangePassword(true)}
              >
                <img
                  src={changePasswordIcon}
                  alt="change password"
                  className="w-5 h-5"
                />
                <span className="text-sm text-[#00000099]">
                  {t("profile.changePasswordTitle")}
                </span>
              </div>
              <div
                className="flex items-center gap-6"
                onClick={() => navigate("/notifications")}
              >
                <img
                  src={notificationIconFilled}
                  alt="notifications"
                  className="w-5 h-5"
                />
                <span className="text-sm text-[#00000099]">
                  {t("notifications.title")}
                </span>
              </div>
              <div className="flex items-center gap-6" onClick={() => {}}>
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#6A1B9A] to-[#D32F2F] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </span>
                <span className="text-sm text-[#00000099]">
                  {t("profile.terms")}
                </span>
              </div>
              <div className="flex items-center gap-6" onClick={() => {}}>
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#6A1B9A] to-[#D32F2F] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">P</span>
                </span>
                <span className="text-sm text-[#00000099]">
                  {t("profile.privacyPolicy")}
                </span>
              </div>
              <div className="flex items-center gap-6" onClick={() => {}}>
                <img
                  src={logoutIcon}
                  alt={t("profile.tabs.signOut")}
                  className="w-5 h-5"
                />
                <span className="text-sm text-[#00000099]">
                  {t("profile.tabs.signOut")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
