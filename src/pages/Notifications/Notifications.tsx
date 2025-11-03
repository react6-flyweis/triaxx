/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useUserStore } from "@/store/zustandStores";
import userAvatar from "@/assets/profile/user.svg";
import { getCurrentEmployeeNotifications } from "@/api/employeeApi";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import backIcon from "@/assets/back.svg"; // Adjust path if needed
// import notificationIcon from "@/assets/profile/notification_light.svg"; // Adjust path if needed
import { useNavigate } from "react-router-dom";
// import { useWalkthroughStore } from '@/store/walkthroughStore';

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

function getNotificationGroup(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const isToday =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();
  if (isToday) return "Today";

  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const diffDays = Math.round(
    (startOfNow.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays >= 7 && diffDays < 30) return "a week ago";
  if (diffDays >= 30) return "a month ago";
  return null;
}

function groupNotifications(notifications: any[]) {
  const groups: { [key: string]: any[] } = {};
  notifications.forEach((notif) => {
    const group = getNotificationGroup(notif.createdAt);
    if (!group) return;
    if (!groups[group]) groups[group] = [];
    groups[group].push(notif);
  });
  // Only include groups that have notifications, in the correct order
  const order = [
    "Today",
    "Yesterday",
    ...Object.keys(groups)
      .filter((g) => /\d+ days ago/.test(g))
      .sort((a, b) => parseInt(a) - parseInt(b)),
    "a week ago",
    "a month ago",
  ];
  return order
    .filter((g) => groups[g])
    .map((g) => ({ group: g, notifications: groups[g] }));
}

const NotificationList: React.FC = () => {
  const fetchUserNotifications = useUserStore((s) => s.fetchUserNotifications);
  const markNotificationAsRead = useUserStore((s) => s.markNotificationAsRead);
  type Notification = Awaited<
    ReturnType<typeof getCurrentEmployeeNotifications>
  >[number];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const isMobile = useMediaQuery("(max-width: 640px)");
  const navigate = useNavigate();
  // const { settingsHighlight, setSettingsHighlight } = useWalkthroughStore();

  useEffect(() => {
    fetchUserNotifications().then((data) => {
      setNotifications(data as Notification[]);
      setLoading(false);
    });
  }, [fetchUserNotifications]);

  // useEffect(() => {
  //   if (settingsHighlight === 'notifications') {
  //     const timer = setTimeout(() => {
  //       setSettingsHighlight('notifications-reset');
  //       navigate('/settings');
  //     }, 3000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [settingsHighlight, setSettingsHighlight, navigate]);

  const onBack = () => {
    navigate(-1);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  const grouped = groupNotifications(notifications);

  return (
    <div
      className={`${
        isMobile ? "min-h-screen" : "p-8 min-h-screen "
      } notifications-highlight  w-full bg-white`}
    >
      {isMobile ? (
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
                Notifications
              </span>
            </div>
            {/* <img
              src={notificationIcon}
              alt="notif"
              className="w-8 h-8"
              onClick={() => navigate("/notifications")}
            /> */}
          </div>
        </div>
      ) : (
        <h1 className="text-2xl font-bold mb-8">Notifications</h1>
      )}
      <div
        className={
          isMobile ? "flex flex-col gap-2 p-4 pt-2 pb-4" : "flex flex-col gap-6"
        }
      >
        {grouped.map(({ group, notifications }) => (
          <React.Fragment key={group}>
            <div className="text-lg font-bold text-gray-800 mt-6 mb-2 ">
              {group}
            </div>
            {notifications.map((notif) => {
              const timeLabel =
                group === "Today" ? formatTime(notif.createdAt) : group;
              return (
                <div
                  key={notif.id}
                  className={
                    isMobile
                      ? "flex items-start gap-3  rounded-lg shadow  py-2 px-1 cursor-pointer "
                      : "flex items-start gap-4 bg-white rounded-xl shadow-md px-6 py-4 cursor-pointer hover:shadow-lg transition-all"
                  }
                  style={{ opacity: notif.isRead ? 0.6 : 1 }}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <img
                    src={userAvatar}
                    alt="avatar"
                    className={
                      isMobile
                        ? "w-8 h-8 rounded-full object-cover mt-1"
                        : "w-12 h-12 rounded-full object-cover mt-1"
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      className={
                        isMobile
                          ? "flex items-center gap-2 text-sm"
                          : "flex flex-wrap items-center gap-2 text-base"
                      }
                    >
                      <span className="font-semibold text-black">
                        {notif.title}
                      </span>
                    </div>
                    <div
                      className={
                        isMobile ? "text-xs text-gray-600" : "text-gray-600"
                      }
                    >
                      {notif.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {timeLabel}
                    </div>
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default NotificationList;
