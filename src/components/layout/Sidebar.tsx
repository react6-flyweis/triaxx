import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/slice/authSlice';
import toast from 'react-hot-toast';

import TriaxxLogo from '@/assets/tiaxx_logo.svg';
import UserIcon from '@/assets/navbar/profile_icon.svg';
import QuickOrderIcon from '@/assets/navbar/quick_order_icon.svg';
import TableIcon from '@/assets/navbar/table_icon.svg';
import OrderHistoryIcon from '@/assets/navbar/table_icon.svg';
import TrainingIcon from '@/assets/navbar/user2_icon.svg';
import TeamChatsIcon from '@/assets/navbar/headphone_icon.svg';
import SettingIcon from '@/assets/navbar/settings_icon.svg';
import SignOutIcon from '@/assets/navbar/logout_icon.svg';

const navItems = [
  { label: 'Quick order', icon: QuickOrderIcon, path: '/orders', className: 'quick-order-btn' },
  { label: 'Table', icon: TableIcon, path: '/table', className: 'table-btn' },
  { label: 'Order History', icon: OrderHistoryIcon, path: '/order-history', className: 'order-history-btn' },
];

const trainingItems = [
  { label: 'Training', icon: TrainingIcon, path: '/training', className: '' },
  { label: 'Team chats', icon: TeamChatsIcon, path: '/team-chats', className: 'team-chats-btn' },
];

const bottomItems = [
  { label: 'Setting', icon: SettingIcon, path: '/settings', className: 'settings-btn' },
  { label: 'sign out', icon: SignOutIcon, path: '/logout', className: '' },
];

interface SidebarProps {
  onLogoutClick?: () => void; // Optional prop, not used since we'll handle logout directly
}

const Sidebar: React.FC<SidebarProps> = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!', {
      duration: 4000,
      position: 'top-right',
    });
    navigate('/login');
  };

  return (
    <aside
      className="hidden lg:flex flex-col h-screen w-[250px] fixed px-6 py-8 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] items-center border-r"
      style={{ borderRightColor: '#00000033' }}
    >
      {/* Logo */}
      <div className="mb-8">
        <Link to="/">
          <img src={TriaxxLogo} alt="TRIAXX logo" className="h-6" />
        </Link>
      </div>
      {/* User */}
      <div className="flex gap-2 items-center bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-full px-4 py-2 mb-8">
        <img src={UserIcon} alt="User" className="h-8 w-8 mr-3" />
        <div className="flex flex-col text-left">
          <span className="text-sm font-semibold leading-tight">Jackline</span>
          <span className="text-xs text-[#7c7c7c] leading-tight">Staff</span>
        </div>
      </div>
      {/* Main nav */}
      <nav className="flex flex-col gap-2 mb-8">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-medium transition-all duration-150 ${isActive(item.path)
              ? 'bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white'
              : 'text-black hover:bg-[#f3e3ee]'
            } ${item.className}`}
          >
            <img
              src={item.icon}
              alt={item.label}
              className={`h-5 w-5 ${isActive(item.path) ? 'invert' : ''}`}
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* Training section */}
      <div className="mb-2 mt-2 text-xs text-[#7c7c7c] font-semibold">Training</div>
      <nav className="flex flex-col gap-2 mb-8">
        {trainingItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-medium transition-all duration-150 ${isActive(item.path)
              ? 'bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white'
              : 'text-black hover:bg-[#f3e3ee]'
            } ${item.className}`}
          >
            <img
              src={item.icon}
              alt={item.label}
              className={`h-5 w-5 ${isActive(item.path) ? 'invert' : ''}`}
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* Bottom section */}
      <div className="mt-auto flex flex-col gap-2 w-full">
        {bottomItems.map((item) =>
          item.label === 'sign out' ? (
            <button
              key={item.label}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-5 py-2.5 rounded-full font-medium text-black hover:bg-[#f3e3ee] transition-all duration-150"
            >
              <img src={item.icon} alt={item.label} className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full font-medium transition-all duration-150 ${isActive(item.path)
                ? 'bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white'
                : 'text-black hover:bg-[#f3e3ee]'
              } ${item.className}`}
            >
              <img
                src={item.icon}
                alt={item.label}
                className={`h-5 w-5 ${isActive(item.path) ? 'invert' : ''}`}
              />
              <span>{item.label}</span>
            </Link>
          )
        )}
      </div>
    </aside>
  );
};

export default Sidebar;