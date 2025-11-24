import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import LeftPanel from "@/components/common/LeftPanel";

// Placeholder asset paths
import TriaxxLogoImg from "@/assets/tiaxx_logo.svg";
import EyeIconImg from "@/assets/eye_icon.svg";
import EyeSlashIconImg from "@/assets/eye-password-hide.svg";
import SuccessCheckIcon from "@/assets/auth/right_tick.svg";

import { verifyOtp } from "@/api/authApi";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;
  const { t } = useTranslation();

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Call verify-otp endpoint with email, otp and newPassword
      if (!email || !otp) {
        throw new Error("Missing email or OTP. Please retry the flow.");
      }
      await verifyOtp({ email, otp, newPassword: password });
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-background-mobile p-4 lg:p-0 lg:bg-[#F8F8F8]">
      <div className="flex w-full max-w-sm flex-col rounded-3xl bg-white p-6 shadow-2xl lg:h-screen lg:max-w-none lg:flex-row lg:p-0 lg:shadow-none lg:rounded-none">
        {/* Left Panel */}
        <LeftPanel />

        {/* Right Panel */}
        <div className="w-full lg:w-2/5 lg:p-10 xl:px-20 flex flex-col justify-center">
          {isSuccess ? (
            <div className="text-center">
              <img
                src={TriaxxLogoImg}
                alt="TRIAXX Logo"
                className="h-10 mx-auto mb-8"
              />
              <img
                src={SuccessCheckIcon}
                alt="Success"
                className="h-16 w-16 mx-auto mb-6"
              />
              <h1 className="text-2xl font-bold mb-4">
                <span className="text-green-500">✔</span> Password Updated
              </h1>
              <p className="text-gray-600 mb-8">
                Your new password is ready to use. Please log back into your
                Triaxx account and Start your day!
              </p>
              <Link
                to="/login"
                className="w-full max-w-sm bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90"
              >
                Login to Account
              </Link>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-xl lg:text-2xl font-bold">Sign in</h2>
                <img
                  src={TriaxxLogoImg}
                  alt="TRIAXX Logo"
                  className="h-6 lg:h-8"
                />
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl lg:text-[32px] font-bold">
                  Set a New Password
                </h3>
                <p className="text-sm text-[#000000CC] mt-2 font-normal max-w-xs mx-auto">
                  Set a new password below. Make sure it's strong to keep your
                  account secure! 🌲
                </p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="password"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.reset.placeholderNewPassword")}
                    className="w-full mt-1 px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 top-6"
                  >
                    <img
                      src={showPassword ? EyeSlashIconImg : EyeIconImg}
                      alt="Toggle visibility"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
                <div className="relative">
                  <label
                    className="block text-sm font-medium mb-1"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("auth.reset.placeholderConfirmPassword")}
                    className="w-full mt-1 px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 top-6"
                  >
                    <img
                      src={showConfirmPassword ? EyeSlashIconImg : EyeIconImg}
                      alt="Toggle visibility"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Tip: Use at least 8 characters with a mix of uppercase
                  letters, lowercase letters, and numbers for better security.
                </p>
                {error && (
                  <p className="text-sm text-red-600 text-center py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 disabled:opacity-70"
                >
                  {isLoading ? t("auth.reset.saving") : t("auth.reset.save")}
                </button>
              </form>
              <Link
                to="/login"
                className="mt-4 w-full text-center   font-semibold  px-4 gradient-border hover:opacity-90"
              >
                <div className="gradient-border-inner">Back</div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
