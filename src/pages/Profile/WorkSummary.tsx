import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import rolesIcon from "@/assets/profile/user_icon_light.svg";
import orderServedIcon from "@/assets/profile/total_earninig.svg";
import WeeklyChart from "@/components/common/WeeklyChart";
import TodayProgress from "@/components/common/TodayProgress";
import Skeleton from "@/components/common/Skeleton";
// no local states: use RTK Query hooks instead
import { useNavigate } from "react-router-dom";
import backIcon from "@/assets/back.svg";
import notificationIcon from "@/assets/profile/notification_light.svg";
import { useGetEmployeeWeeklyOrdersQuery } from "@/redux/api/employeeApi";
import { useTranslation } from "react-i18next";

interface WorkSummaryProps {
  layout: "desktop" | "mobile";
}

// Today's progress extracted into `src/components/common/TodayProgress.tsx`

const WorkSummary: React.FC<WorkSummaryProps> = ({ layout }) => {
  const { t } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  // Use RTK Query weekly summary for chart + progress
  const { data: weeklyResp, isLoading: loadingWeekly } =
    useGetEmployeeWeeklyOrdersQuery(user?.Employee_id || "current", {
      skip: !user?.Employee_id,
    });

  const apiChart = weeklyResp?.chart ?? undefined;
  const apiSummary = weeklyResp?.summary ?? undefined;
  // weeklyResp may not contain some properties like growthPercent or totalTips
  const growthPercent =
    (weeklyResp as { growthPercent?: number })?.growthPercent ?? 0;
  const totalTips = (weeklyResp as { totalTips?: number })?.totalTips ?? 0;

  // No manual fetch/useEffect anymore — RTK Query handles data fetching, caching and re-fetching

  const formatHours = (h: number) => {
    if (!h) return `00:00 ${t("workSummary.timeHoursSuffix", "hrs")}`;
    const hours = Math.floor(h);
    const minutes = Math.round((h - hours) * 60);
    const mm = String(minutes).padStart(2, "0");
    const hh = String(hours).padStart(2, "0");
    return `${hh}:${mm} ${t("workSummary.timeHoursSuffix", "hrs")}`;
  };

  if (loadingWeekly) {
    // Render a skeleton layout similar to final layout for better UX
    const containerClass =
      layout === "desktop"
        ? "grid grid-cols-3 gap-6"
        : "flex flex-col gap-6 p-4";
    return (
      <div className="pt-0">
        <div className={containerClass}>
          {/* Today Progress Skeleton */}
          <div className="rounded-2xl p-6 flex flex-col items-center min-w-[260px] min-h-[260px] relative bg-[linear-gradient(180deg,rgba(106,27,154,0.03)_0%,rgba(211,47,47,0.03)_100%)]">
            <div className="mb-2 font-bold text-lg text-black">
              <Skeleton width="w-40" height="h-6" />
            </div>
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-[140px] h-[140px] rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div className="flex items-center gap-1 mt-2 text-base font-medium">
              <Skeleton width="w-20" height="h-4" />
            </div>
          </div>
          {/* Weekly Summary Skeleton */}
          <div className="rounded-2xl p-6 flex flex-col items-start min-w-[260px] min-h-[260px] bg-[linear-gradient(180deg,rgba(106,27,154,0.03)_0%,rgba(211,47,47,0.03)_100%)]">
            <div className="mb-2 font-bold text-lg">
              <Skeleton width="w-36" height="h-6" />
            </div>
            <div className="text-[#D32F2F] font-semibold mb-2 text-lg">
              <Skeleton width="w-32" height="h-6" />
            </div>
            <div className="w-full">
              <div className="w-full h-40">
                {/* Weekly chart component has its own skeleton — but show smaller blocks for immediate UX */}
                <div className="flex items-end justify-between w-full h-full px-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center w-8">
                      <div
                        className={`w-3.5 bg-gray-200 rounded-lg animate-pulse mb-2`}
                        style={{
                          height: `${40 + (i % 3) * 10}px`,
                          borderRadius: 16,
                        }}
                      />
                      <div className="w-3 h-3 rounded-full mb-1 bg-gray-200 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Cards skeleton */}
          <div className="col-span-1 flex flex-col gap-4 w-full">
            <div className="rounded-2xl p-5 flex flex-col min-w-[260px] min-h-[120px] bg-[linear-gradient(180deg,rgba(106,27,154,0.03)_0%,rgba(211,47,47,0.03)_100%)]">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton width="w-8" height="h-8" rounded="rounded-lg" />
                <Skeleton width="w-40" height="h-6" />
              </div>
              <div className="text-xl font-bold mb-1">
                <Skeleton width="w-24" height="h-8" />
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {[1, 2].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-5 flex flex-col min-w-[180px] min-h-[120px] bg-[linear-gradient(180deg,rgba(106,27,154,0.03)_0%,rgba(211,47,47,0.03)_100%)]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Skeleton width="w-6" height="h-6" rounded="rounded-lg" />
                    <Skeleton width="w-16" height="h-4" />
                  </div>
                  <div className="text-xl font-bold mb-1">
                    <Skeleton width="w-20" height="h-8" />
                  </div>
                  <div className="text-sm font-semibold">
                    <Skeleton width="w-32" height="h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
                <img
                  src={backIcon}
                  alt={t("workSummary.backAlt", "Back")}
                  className="w-6 h-6"
                />
              </button>
              <span className="text-white text-2xl font-bold text-left">
                {t("workSummary.title")}
              </span>
            </div>
            <button
              onClick={() => navigate("/notifications")}
              className="focus:outline-none text-white"
            >
              <img
                src={notificationIcon}
                alt={t("profile.notificationsAlt", "Notifications")}
                className="w-8 h-8"
              />
            </button>
          </div>
        </div>
      </div>
      {/* Desktop Title */}
      <div className="hidden md:block text-xl font-semibold mb-4 text-[#00000099]">
        {t("workSummary.title")}
      </div>
      <div className={containerClass}>
        {/* Today's Progress (Circular Progress) */}
        {(() => {
          const workedTime =
            apiSummary?.todayWorkingHour !== undefined
              ? formatHours(apiSummary.todayWorkingHour)
              : "00:00 hrs";
          const remainingTime = "00:00 hrs";
          return <TodayProgress today={{ workedTime, remainingTime }} />;
        })()}
        {/* Weekly Summary (Bar Chart*/}
        <div className="bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] rounded-2xl p-6 flex flex-col items-start min-w-[260px] min-h-[260px]">
          <div className="mb-2 font-bold text-lg ">
            {t("workSummary.weeklySummary")}
          </div>
          {/** compute total orders for the week from API summary or workSummary.weekly */}
          <div className="text-[#D32F2F] font-semibold mb-2 text-lg">
            {(() => {
              const totalFromSummary =
                apiSummary?.totalOrderServed ?? weeklyResp?.total_orders;
              if (typeof totalFromSummary === "number")
                return `${totalFromSummary} ${t("workSummary.ordersSuffix")}`;
              const total = Object.values((apiChart ?? {}) || {}).reduce(
                (sum: number, item: { orders?: number }) =>
                  sum + (item?.orders || 0),
                0
              );
              return `${total} ${t("workSummary.ordersSuffix")}`;
            })()}
          </div>
          <WeeklyChart employeeId={user?.Employee_id} initialData={apiChart} />
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
                <span className="font-bold text-lg">
                  {t("workSummary.totalCustomer")}
                </span>
                <span className="text-green-600 text-xs font-semibold ml-2">
                  +{growthPercent}%{" "}
                  <span className="inline-block align-middle">↑</span>
                </span>
              </div>
              <div className="text-xl font-bold mb-1 text-primary-gradient">
                {apiSummary?.totalCustomer ?? 0}
              </div>
              <div className="flex flex-wrap gap-2 text-sm mt-2">
                <span className="font-bold text-black/80">
                  {t("workSummary.periods.total")}
                </span>
                <span className="text-black/60">
                  {t("workSummary.periods.morning")}
                </span>
                <span className="text-black/60">
                  {t("workSummary.periods.noon")}
                </span>
                <span className="text-black/60">
                  {t("workSummary.periods.evening")}
                </span>
                <span className="text-black/60">
                  {t("workSummary.periods.night")}
                </span>
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
                      +{growthPercent}%{" "}
                      <span className="inline-block align-middle">↑</span>
                    </span>
                  </div>
                  <div className="text-xl font-bold mb-1 text-primary-gradient">
                    {apiSummary?.totalOrderServed ??
                      weeklyResp?.total_orders ??
                      0}
                  </div>
                  <div className="text-sm font-semibold">
                    {t("workSummary.totalOrderServed")}
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
                <span className="font-bold text-lg">
                  {t("workSummary.totalCustomerToday")}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-primary-gradient">
                  {apiSummary?.totalCustomer ?? 0}
                </span>
                <span className="text-green-600 text-xs font-semibold">
                  +{growthPercent}%{" "}
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
                <span className="font-bold text-lg">
                  {t("workSummary.totalCustomerToday")}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-primary-gradient">
                  {apiSummary?.totalOrderServed ??
                    weeklyResp?.total_orders ??
                    0}
                </span>
                <span className="text-green-600 text-xs font-semibold">
                  +{growthPercent}%{" "}
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
                <span className="font-bold text-lg">
                  {t("workSummary.totalTipsEarned")}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-primary-gradient">
                  {totalTips}
                </span>
                <span className="text-green-600 text-xs font-semibold">
                  +{growthPercent}%{" "}
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
