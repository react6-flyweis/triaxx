import React from "react";

const getPercent = (worked: string, remaining: string) => {
  // worked/remaining format: '05:45 hrs' or '5:45'
  const parse = (s: string) => {
    const t = s.split(" ")[0];
    const parts = t.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return Number(t) * 60 || 0;
  };
  const workedMinutes = parse(worked);
  const remainingMinutes = parse(remaining);
  const total = workedMinutes + remainingMinutes;
  return total === 0 ? 0 : Math.round((workedMinutes / total) * 100);
};

const CircularProgress: React.FC<{
  percent: number;
  workedTime: string;
}> = ({ percent, workedTime }) => {
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
        <span className="text-xl font-bold text-black mb-1">{workedTime}</span>
        <span className="text-base font-semibold text-black">Work Time</span>
      </div>
    </div>
  );
};

const TodayProgress: React.FC<{
  today: { workedTime: string; remainingTime: string };
}> = ({ today }) => {
  const percent = getPercent(today.workedTime, today.remainingTime);
  return (
    <div className="rounded-2xl p-6 flex flex-col items-center min-w-[260px] min-h-[260px] relative bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)]">
      <div className="mb-2 font-bold text-lg text-black">Today's Progress</div>
      <CircularProgress percent={percent} workedTime={today.workedTime} />
      <div className="flex items-center gap-1 mt-2 text-base font-medium">
        <span>{today.remainingTime} Left</span>
      </div>
    </div>
  );
};

export default TodayProgress;
