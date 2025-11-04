import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LeftPanel from "@/components/common/LeftPanel";
import { sendOtp } from "@/api/authApi";

// Placeholder asset paths - replace with your actual paths
import TriaxxLogoImg from "@/assets/tiaxx_logo.svg";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  // const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResetRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await sendOtp(email);
      // navigate to verify OTP page with email
      navigate("/verify-otp", { state: { email } });
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
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl lg:text-2xl font-bold">Sign in</h2>
            <img src={TriaxxLogoImg} alt="TRIAXX Logo" className="h-6 lg:h-8" />
          </div>

          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-[32px] font-bold">
              Forget Password
            </h3>
            <p className="text-sm text-[#000000CC] mt-2 font-normal">
              we will send you instructions for reset in registered email
            </p>
          </div>

          <form onSubmit={handleResetRequest} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email here"
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
              className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 disabled:opacity-70 mt-4"
            >
              {isLoading ? "Sending..." : "Submit"}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-4 w-full text-center   font-semibold py-3 px-4 gradient-border hover:opacity-90"
          >
            <div className="gradient-border-inner">Back</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
