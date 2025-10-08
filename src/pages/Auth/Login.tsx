import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '@/redux/api/apiSlice';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/redux/slice/authSlice';
import toast, { Toaster } from 'react-hot-toast';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import LeftPanel from '@/components/common/LeftPanel';

import TriaxxLogoImg from '@/assets/tiaxx_logo.svg';
import EyeIconImg from '@/assets/eye_icon.svg';
import EyeSlashIconImg from '@/assets/eye-password-hide.svg';
import FacebookIconImg from '@/assets/auth/facebook.svg';
import GoogleIconImg from '@/assets/auth/google.svg';
import AppleIconImg from '@/assets/auth/apple.svg';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Restaurant' | 'Employee' | 'Admin'>('Employee');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const handleLogin = async (event: any) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await login({ email: employeeId, password }).unwrap();
      dispatch(setCredentials({
        token: result.data.token,
        user: result.data.user,
      }));
      toast.success('Login successful!', {
        duration: 4000,
        position: 'top-right',
      });
      navigate('/');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Login failed. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'facebook' | 'google' | 'apple') => {
    setIsLoading(true);
    try {
      // Implement social login logic here if available
      toast.success(`${provider} login successful!`, {
        duration: 4000,
        position: 'top-right',
      });
    } catch (err: any) {
      toast.error(`An error occurred during ${provider} login.`, {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen items-center justify-center ${isMobile ? 'gradient-background-mobile' : 'gradient-background'} p-4 lg:p-0`}>
      <div className="flex w-full max-w-sm flex-col rounded-3xl bg-white p-6 shadow-2xl lg:h-screen lg:max-w-none lg:flex-row lg:p-0 lg:shadow-none lg:rounded-none">
        <LeftPanel />
        <div className="w-full lg:w-2/5 lg:p-10 xl:px-20 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl lg:text-2xl font-bold">Sign in</h2>
            <img src={TriaxxLogoImg} alt="TRIAXX Logo" className="h-6 lg:h-8" />
          </div>
          <div className="text-center mb-2">
            <h3 className="text-2xl lg:text-[32px] font-bold">Welcome Back!</h3>
            <p className="text-sm text-[#000000CC] mt-1 font-normal">Login to access your Triaxx Account</p>
          </div>
          <div className="flex justify-center space-x-2 sm:space-x-6 my-6 lg:my-8 border-b border-gray-200">
            {(['Restaurant', 'Employee', 'Admin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 sm:px-2 text-base font-bold focus:outline-none
                  ${activeTab === tab ? 'bg-clip-text text-transparent text-primary-gradient border-b-2 border-red-600' : 'text-[#00000099] hover:text-gray-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === 'Employee' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium mb-1">Employee id</label>
                <input
                  id="employeeId"
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter id"
                  className="w-full px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 focus:border-purple-600 focus:bg-white text-sm placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#00000099] hover:cursor-pointer">Forget Password?</Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full px-4 py-3 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] border-transparent rounded-lg focus:ring-1 focus:ring-purple-600 focus:border-purple-600 focus:bg-white text-sm placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                  >
                    <img src={showPassword ? EyeSlashIconImg : EyeIconImg} alt="Toggle password visibility" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">Remember me</label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70"
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}
          {activeTab !== 'Employee' && (
            <div className="text-center py-12 text-gray-500">{activeTab} login form will be here.</div>
          )}
          <p className="mt-6 text-sm text-center text-gray-700">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-[#FF8682] hover:cursor-pointer">Sign up</a>
          </p>
          <div className="mt-6 flex items-center">
            <hr className="w-full border-gray-300" />
            <span className="px-2 text-xs text-gray-500 whitespace-nowrap">Or login with</span>
            <hr className="w-full border-gray-300" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full flex items-center justify-center py-4 border border-[#515DEF] rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img src={FacebookIconImg} alt="Facebook" className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center py-4 border border-[#515DEF] rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img src={GoogleIconImg} alt="Google" className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleSocialLogin('apple')}
              className="w-full flex items-center justify-center py-4 border border-[#515DEF] rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <img src={AppleIconImg} alt="Apple" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default LoginPage;