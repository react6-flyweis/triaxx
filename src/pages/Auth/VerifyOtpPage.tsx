import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LeftPanel from "@/components/common/LeftPanel";
import { sendOtp } from "@/api/authApi";

// Placeholder asset paths - replace with your actual paths
import TriaxxLogoImg from "@/assets/tiaxx_logo.svg";

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your-email@example.com"; // Fallback for display
  const { t } = useTranslation();

  const handleVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Do a local navigation to reset-password, passing the email and otp
      navigate("/reset-password", { state: { email, otp } }); // Navigate to the next step
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Clear previous messages
    setResendMessage(null);
    setError(null);
    if (!email) {
      setError("No email available to resend OTP.");
      return;
    }
    setIsResending(true);
    try {
      await sendOtp(email);
      setResendMessage("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-background-mobile p-4 lg:p-0 lg:bg-[#F8F8F8]">
      <div className="flex w-full max-w-sm flex-col rounded-3xl bg-white p-6 shadow-2xl lg:h-screen lg:max-w-none lg:flex-row lg:p-0 lg:shadow-none lg:rounded-none">
        {/* Left Panel */}
        <LeftPanel />

        {/* Right Panel */}
        <div className="w-full lg:w-2/5 lg:p-10 xl:px-20 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl lg:text-2xl font-bold">Sign in</h2>
            <img src={TriaxxLogoImg} alt="TRIAXX Logo" className="h-6 lg:h-8" />
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-[32px] font-bold">Verify OTP</h3>
            <p className="text-sm text-[#000000CC] mt-2 font-normal">
              Please Enter the Authentication received to your registered email
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-1">
                {t("auth.verify.label")}
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder={t("auth.verify.placeholder")}
                className="w-full px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 text-sm placeholder-gray-400"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 disabled:opacity-70"
            >
              {isLoading ? t("auth.verify.verifying") : t("auth.verify.submit")}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Didn't receive a code?{" "}
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              type="button"
              className="font-semibold text-[#FF8682] hover:underline disabled:opacity-60"
            >
              {isResending ? "Resending..." : "Resend"}
            </button>
          </p>

          {resendMessage && (
            <p className="text-sm text-green-600 text-center mt-2">
              {resendMessage}
            </p>
          )}

          <Link
            to="/login"
            className="mt-4 w-full text-center border border-[#6A1B9A] text-transparent bg-clip-text bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] font-semibold py-3 px-4 rounded-lg hover:opacity-90"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
