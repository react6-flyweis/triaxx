import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import clockIcon from "@/assets/profile/clock_icon2.svg";
import rolesIcon from "@/assets/profile/user_icon_light.svg";
import orderServedIcon from "@/assets/profile/total_earninig.svg";
import { useNavigate } from "react-router-dom";
import backIcon from "@/assets/back.svg";
import notificationIcon from "@/assets/profile/notification_light.svg";
import { useStore } from "@/store/zustandStores";

interface WorkSummaryProps {
  layout: "desktop" | "mobile";
}

// Helper for circular progress
const CircularProgress = ({
  percent,
  workedTime,
}: {
  percent: number;
  workedTime: string;
}) => {
  const radius = 80;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center w-[200px] h-[200px] mx-auto">
      <svg width={radius * 2} height={radius * 2}>
        <defs>
          <linearGradient id="circleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6A1B9A" />
            <stop offset="100%" stopColor="#D32F2F" />
          </linearGradient>
        </defs>
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="#E5D0F6"
          strokeWidth={stroke}
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="url(#circleGradient)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
      </svg>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[#000] mb-1">{workedTime}</span>
        <span className="text-base font-semibold text-[#000]">Work Time</span>
      </div>
    </div>
  );
};

// Helper for bar chart
const WeeklyBarChart = ({
  data,
}: {
  data: { [day: string]: { orders: number } };
}) => {
  // Map to S M T W T F S order
  const days = ["S", "M", "T", "W", "T2", "F", "S2"];
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const maxOrders = Math.max(...Object.values(data).map((d) => d.orders));
  return (
    <div className="flex items-end justify-between w-full h-40 px-2">
      {days.map((day, idx) => {
        const isLast = idx === 6;
        const barHeight = ((data[day]?.orders || 0) / maxOrders) * 110 + 30; // min height for visual
        return (
          <div key={day} className="flex flex-col items-center w-8">
            <div
              className="w-3.5"
              style={{
                height: `${barHeight}px`,
                borderRadius: "16px",
                background: isLast
                  ? "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)"
                  : "#00000099",
                boxShadow: isLast ? "0 2px 8px #6A1B9A33" : undefined,
                marginBottom: 8,
              }}
            ></div>
            <div
              className="w-3 h-3 rounded-full mb-1"
              style={{
                background: isLast
                  ? "linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)"
                  : "#00000099",
              }}
            ></div>
            <span
              className="text-xs text-[#000] font-semibold mt-1"
              style={{ opacity: 0.7 }}
            >
              {dayLabels[idx]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const WorkSummary: React.FC<WorkSummaryProps> = ({ layout }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  // Keep workSummary as zustand-local state for now
  const workSummary = useStore((state) => state.workSummary);
  const fetchWorkSummary = useStore((state) => state.fetchWorkSummary);
  const navigate = useNavigate();

  // Calculate percent for circular progress (dynamic)
  function getPercent(worked: string, remaining: string) {
    // worked/remaining format: '05:45 hrs', '03:00 hrs'
    const [wh, wm] = worked.split(" ")[0].split(":").map(Number);
    const [rh, rm] = remaining.split(" ")[0].split(":").map(Number);
    const workedMinutes = wh * 60 + wm;
    const remainingMinutes = rh * 60 + rm;
    const total = workedMinutes + remainingMinutes;
    return total === 0 ? 0 : Math.round((workedMinutes / total) * 100);
  }

  useEffect(() => {
    if (!workSummary) {
      fetchWorkSummary();
    }
  }, [workSummary, fetchWorkSummary, user?.Employee_id, user]);

  if (!workSummary) {
    return <div className="text-center py-10">Loading work summary...</div>;
  }

  // Layout-specific classes
  const containerClass =
    layout === "desktop" ? "grid grid-cols-3 gap-6" : "flex flex-col gap-6 p-4";

  return (
    <div className=" pt-0 ">
      {/* Mobile Header */}
      <div className="md:hidden block mb-4">
        <div
          className="relative w-full h-20"
          style={{
            background: "linear-gradient(90deg, #D32F2F 0%, #6A1B9A 100%)",
          }}
        >
          <div className="flex items-center justify-between px-4 pt-6">
            <div className="flex gap-4">
              <button
                className="text-white text-2xl"
                onClick={() => navigate(-1)}
              >
                <img src={backIcon} alt="Back" className="w-6 h-6" />
              </button>
              <span className="text-white text-2xl font-bold text-left">
                Work Summary
              </span>
            </div>
            <button
              onClick={() => navigate("/notifications")}
              className="focus:outline-none text-white"
            >
              <img
                src={notificationIcon}
                alt="Notifications"
                className="w-8 h-8"
              />
            </button>
          </div>
        </div>
      </div>
      {/* Desktop Title */}
      <div className="hidden md:block text-xl font-semibold mb-4 text-[#00000099]">
        Work Summary
      </div>
      <div className={containerClass}>
        {/* Today's Progress (Circular Progress) */}
        <div className="rounded-2xl p-6 flex flex-col items-center min-w-[260px] min-h-[260px] relative bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)]">
          <div className="mb-2 font-bold text-lg text-[#000]">
            Today's Progress
          </div>
          <CircularProgress
            percent={getPercent(
              workSummary.today.workedTime,
              workSummary.today.remainingTime
            )}
            workedTime={workSummary.today.workedTime}
          />
          <div className="flex items-center gap-1 mt-2 text-base font-medium">
            <img src={clockIcon} />
            <span>{workSummary.today.remainingTime} Left</span>
          </div>
        </div>
        {/* Weekly Summary (Bar Chart*/}
        <div className="bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-2xl p-6 flex flex-col items-start min-w-[260px] min-h-[260px]">
          <div className="mb-2 font-bold text-lg ">Weekly Summary</div>
          <div className="text-[#D32F2F] font-semibold mb-2 text-lg">
            9 600 XOF
          </div>
          <WeeklyBarChart data={workSummary.weekly} />
        </div>
        {/* Last three cards together in a row for desktop */}
        {layout === "desktop" ? (
          <div className="col-span-1 flex flex-col gap-4 w-full">
            <div className="bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-2xl p-5 flex flex-col min-w-[260px] min-h-[120px]">
              <div className="flex items-center gap-2 mb-1 ">
                <img
                  src={rolesIcon}
                  alt="icon"
                  className="w-7 h-7 bg-primary-gradient p-1 rounded-lg"
                />
                <span className="font-bold text-lg">Total Customer</span>
                <span className="text-green-600 text-xs font-semibold ml-2">
                  +{workSummary.growthPercent}%{" "}
                  <span className="inline-block align-middle">↑</span>
                </span>
              </div>
              <div className="text-xl font-bold mb-1 text-primary-gradient">
                {workSummary.totalCustomers}
              </div>
              <div className="flex flex-wrap gap-2 text-sm mt-2">
                <span className="font-bold text-black/80">• Total</span>
                <span className="text-black/60">• morning</span>
                <span className="text-black/60">• Noon</span>
                <span className="text-black/60">• Evening</span>
                <span className="text-black/60">• Night</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {[1, 2].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-2xl p-5 flex flex-col min-w-[180px] min-h-[120px]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={orderServedIcon}
                      alt="icon"
                      className="w-6 h-6 bg-primary-gradient p-0.5 rounded-lg"
                    />
                    <span className="text-green-600 text-xs font-semibold">
                      +{workSummary.growthPercent}%{" "}
                      <span className="inline-block align-middle">↑</span>
                    </span>
                  </div>
                  <div className="text-xl font-bold mb-1 text-primary-gradient">
                    {workSummary.totalOrdersServed}
                  </div>
                  <div className="text-sm font-semibold">
                    Total order Served
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5 w-full">
            {/* Total Customer Today */}
            <div className="bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-2xl px-5 py-4 flex flex-col min-w-[220px] min-h-[100px] shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={rolesIcon}
                  alt="icon"
                  className="w-7 h-7 bg-primary-gradient p-1 rounded-lg"
                />
                <span className="font-bold text-lg">Total Customer Today</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-primary-gradient">
                  {workSummary.totalCustomers}
                </span>
                <span className="text-green-600 text-xs font-semibold">
                  +{workSummary.growthPercent}%{" "}
                  <span className="inline-block align-middle">↑</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-sm mt-2">
                <span className="font-bold text-black/80">• Total</span>
                <span className="text-black/60">• Morning</span>
                <span className="text-black/60">• Noon</span>
                <span className="text-black/60">• Night</span>
              </div>
            </div>
            {/* Total Order Served Today */}
            <div className="bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-2xl px-5 py-4 flex flex-col min-w-[220px] min-h-[100px] shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={orderServedIcon}
                  alt="icon"
                  className="w-7 h-7 bg-primary-gradient p-1 rounded-lg"
                />
                <span className="font-bold text-lg">Total Customer Today</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-primary-gradient">
                  {workSummary.totalCustomers}
                </span>
                <span className="text-green-600 text-xs font-semibold">
                  +{workSummary.growthPercent}%{" "}
                  <span className="inline-block align-middle">↑</span>
                </span>
              </div>
              {/* <div className="flex flex-wrap gap-2 text-sm mt-2">
                <span className="font-bold text-black/80">• Total</span>
                <span className="text-black/60">• Morning</span>
                <span className="text-black/60">• Noon</span>
                <span className="text-black/60">• Night</span>
              </div> */}
            </div>
            {/* Total Tips Earned */}
            <div className="bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-2xl px-5 py-4 flex flex-col min-w-[220px] min-h-[100px] shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <img
                  src={orderServedIcon}
                  alt="icon"
                  className="w-7 h-7 bg-primary-gradient p-1 rounded-lg"
                />
                <span className="font-bold text-lg">Total Tips Earned</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-primary-gradient">
                  {workSummary.totalTips}
                </span>
                <span className="text-green-600 text-xs font-semibold">
                  +{workSummary.growthPercent}%{" "}
                  <span className="inline-block align-middle">↑</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkSummary;
