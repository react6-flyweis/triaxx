import React, { useEffect } from "react";
import { useUserStore } from "@/store/zustandStores";
import type { UserProfile } from "@/store/zustandStores";
import PowerIcon from "@/icons/PowerIcon";
import { useGetClockRecordsByAuthQuery } from "@/redux/api/clockApi";

function RecentActivities() {
  const { data: clockData, isLoading, error } = useGetClockRecordsByAuthQuery();

  // Format date helper
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    return { day: day.toString(), month };
  };

  // Format time helper
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Calculate time ago
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
        <div className="text-center py-8 text-red-500">
          Failed to load clock records
        </div>
      </div>
    );
  }

  const records = clockData?.data || [];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
      <div className="flex flex-col gap-4">
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No clock records found
          </div>
        ) : (
          records.map((record) => {
            const { day, month } = formatDate(record.date);
            const clockInTime = formatTime(record.in_time);
            const clockOutTime = formatTime(record.out_time);
            const activityText = record.out_time
              ? `Clocked in at ${clockInTime} and clocked out at ${clockOutTime}`
              : `Clocked in at ${clockInTime} (Still active)`;

            return (
              <div
                key={record._id}
                className="flex items-center bg-white rounded-lg shadow p-4 gap-4"
              >
                <div className="flex flex-col items-center justify-center bg-primary-gradient text-white rounded-md w-14 h-14 font-extrabold text-lg">
                  <span>{day}</span>
                  <span className="text-xs">{month}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base">{activityText}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getTimeAgo(record.CreateAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const infoBoxes = [
  (user: UserProfile | null) => ({
    content: (
      <>
        <img
          src={user?.profilePic}
          alt="avatar"
          className="w-14 h-14 rounded-full mr-2 inline-block align-middle"
        />
        <div className="flex flex-col justify-around">
          <span className="align-middle font-medium">{user?.name}</span>
          <span className="text-sm  font-normal">{user?.role}</span>
        </div>
      </>
    ),
    className: "min-w-[120px] flex items-center flex-row",
  }),
  (_user: UserProfile | null, clockInTime?: string) => ({
    content: (
      <div className="flex flex-col justify-center items-center">
        <span className="font-bold">{clockInTime || "8:00 am"}</span>
        <span className="text-xs">Clock in</span>
      </div>
    ),
    className: "",
  }),
  (user: UserProfile | null) => ({
    content: (
      <>
        <span className="font-bold">
          {user?.workSummary?.today?.workedTime || "00"}
        </span>
        <span className="text-xs">
          hrs <br />
          Worked today
        </span>
      </>
    ),
    className: "",
  }),
  () => ({
    content: (
      <>
        <span className="font-bold">00</span>
        <span className="text-xs">
          mins <br />
          Break
        </span>
      </>
    ),
    className: "",
  }),
  () => ({
    content: (
      <>
        <span className="font-bold">--</span>
        <span className="text-xs">
          mins
          <br /> Break
        </span>
      </>
    ),
    className: "",
  }),
  (user: UserProfile | null) => ({
    content: (
      <>
        <span className="font-bold">
          {user?.workDetails?.leavesLeft ?? "--"}
        </span>
        <span className="text-xs">Leaves Left</span>
      </>
    ),
    className: "",
  }),
];

const ClockInOut: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const isClockedIn = useUserStore((s) => s.isClockedIn);
  const clockIn = useUserStore((s) => s.clockIn);
  const clockOut = useUserStore((s) => s.clockOut);
  const fetchActivities = useUserStore((s) => s.fetchActivities);

  // Fetch clock records from API
  const { data: clockData, refetch } = useGetClockRecordsByAuthQuery();

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Determine if currently clocked in from API data
  const isCurrentlyClockedIn = React.useMemo(() => {
    if (!clockData?.data || clockData.data.length === 0) return isClockedIn;

    // Sort by date descending to get the most recent record
    const sortedRecords = [...clockData.data].sort(
      (a, b) => new Date(b.CreateAt).getTime() - new Date(a.CreateAt).getTime()
    );

    const latestRecord = sortedRecords[0];
    // If the latest record has no out_time, user is clocked in
    return latestRecord.out_time === null;
  }, [clockData, isClockedIn]);

  // Get latest clock in time from API
  const latestClockInTime = React.useMemo(() => {
    if (!clockData?.data || clockData.data.length === 0) return "8:00 am";

    const sortedRecords = [...clockData.data].sort(
      (a, b) => new Date(b.CreateAt).getTime() - new Date(a.CreateAt).getTime()
    );

    const latestRecord = sortedRecords[0];
    if (latestRecord.in_time) {
      const date = new Date(latestRecord.in_time);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return "8:00 am";
  }, [clockData]);

  const handleClock = async () => {
    if (isCurrentlyClockedIn) {
      await clockOut();
    } else {
      await clockIn();
    }
    // Refetch clock records after clock in/out
    refetch();
  };

  return (
    <div className=" m-6 px-2 sm:px-6 md:px-10 py-6 w-full">
      <h1 className="text-3xl sm:text-2xl font-bold mb-6">
        Employee Clock in / out
      </h1>
      <div className="flex  items-center justify-center mb-8  ">
        <div className=" flex flex-col items-center bg-white custom-shadow px-12 py-10 rounded-lg">
          <div className=" rounded-full shadow-lg">
            <div
              className={`w-24 h-24 md:w-32 md:h-32 flex justify-center items-center rounded-full  ${
                isCurrentlyClockedIn
                  ? "bg-primary-gradient"
                  : "bg-primary-gradient-light"
              }`}
            >
              {isCurrentlyClockedIn ? (
                <PowerIcon color="white" />
              ) : (
                <PowerIcon />
              )}
            </div>
          </div>
          <div className="gradient-border mt-6 w-[150px] text-center">
            <button
              className={`   transition-all duration-200 w-[148px]  ${
                isCurrentlyClockedIn
                  ? " text-black gradient-border-inner bg-white" // clocked out style
                  : "bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F]  text-white p-3 rounded-xl " // clocked in style
              }`}
              onClick={handleClock}
            >
              {isCurrentlyClockedIn ? "Clock out" : "Clock in"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {infoBoxes.map((fn, i) => (
          <div
            key={i}
            className={`rounded-lg px-4 py-3 flex flex-col items-center justify-center text-center ${
              i === 0
                ? "bg-primary-gradient-light text-primary"
                : "bg-primary-gradient text-white"
            } ${fn(user, i === 1 ? latestClockInTime : undefined).className}`}
            style={{ minWidth: 110 }}
          >
            {fn(user, i === 1 ? latestClockInTime : undefined).content}
          </div>
        ))}
      </div>
      <RecentActivities />
    </div>
  );
};

export default ClockInOut;
