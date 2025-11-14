import React, { useState } from "react";
import { useGetAllSupportTicketsQuery } from "@/redux/api/supportTicketsApi";
import ongoingIcon from "@/assets/setting/sms-tracking-gray.svg";
import ongoingIconLight from "@/assets/setting/sms-tracking.svg";

import resolvedIcon from "@/assets/setting/sms-star.svg";
import allIcon from "@/assets/setting/all-sms-gray.svg";
import { useNavigate } from "react-router-dom";

const tabConfig = [
  { key: "all", label: "All Tickets", color: "text-[#007AFF]", icon: allIcon },
  {
    key: "ongoing",
    label: "On-Going",
    color: "text-[#F8A534]",
    icon: ongoingIcon,
  },
  {
    key: "resolved",
    label: "Resolved",
    color: "text-[#34C759]",
    icon: resolvedIcon,
  },
];

const statusColor = {
  ongoing: "bg-[#F8A534]",
  resolved: "bg-[#34C759]",
  all: "bg-[#007AFF]",
};

const statusBtnColor = {
  ongoing: "bg-[#F8A534] text-white",
  resolved: "bg-[#34C759] text-white",
  all: "bg-[#007AFF] text-white",
};

const SupportTickets: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "ongoing" | "resolved">("all");
  const [period, setPeriod] = useState<"week" | "day" | "month">("week");
  const [search, setSearch] = useState("");

  // Map filter to status for API
  const getStatusFromFilter = (filter: string) => {
    if (filter === "ongoing") return "Pending";
    if (filter === "resolved") return "Resolved";
    return ""; // all tickets
  };

  const { data, isLoading, error } = useGetAllSupportTicketsQuery({
    page: 1,
    limit: 100,
    search: search,
    status: getStatusFromFilter(filter),
  });

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-[#00000099] font-bold text-[32px]">
          Support Ticket &gt;
        </span>
        <span className="text-black font-bold text-[32px]">
          {tabConfig.find((t) => t.key === filter)?.label || "All Ticket"}
        </span>
      </div>
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search for ticket"
            className="w-full max-w-xs border rounded-md px-4 py-2 bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] text-black/80 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            className="border rounded-md px-4 py-2 bg-[#F9F9F9] text-black focus:outline-none"
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as "week" | "day" | "month")
            }
          >
            <option value="week">This Week</option>
            <option value="day">Today</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-8 mb-8">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center gap-2 font-semibold text-lg pb-2 transition-all ${
              filter === tab.key ? `${tab.color} ` : "text-[#BDBDBD] "
            }`}
            onClick={() => setFilter(tab.key as "all" | "ongoing" | "resolved")}
          >
            <img src={tab.icon} alt={tab.label} className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>
      {/* Ticket List */}
      <div className="flex flex-col gap-6">
        {isLoading ? (
          // Skeleton placeholders while loading
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 bg-white/30 shadow flex flex-col gap-4 animate-pulse"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-gray-300`} />
                    <div className="h-4 w-32 bg-gray-300 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-gray-300 rounded" />
                </div>
                <div className="h-6 w-48 bg-gray-300 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-7 h-7 rounded-full bg-gray-300" />
                  <div className="h-4 w-40 bg-gray-300 rounded" />
                  <div className="ml-auto h-4 w-24 bg-gray-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-10">
            {typeof error === "object" && "message" in error
              ? (error as { message: string }).message
              : "Failed to load tickets"}
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="text-center py-10 text-[#BDBDBD]">
            No tickets found.
          </div>
        ) : (
          data.data.map((ticket) => {
            // Map API status to UI status
            const uiStatus =
              ticket.Ticket_status === "Resolved" ? "resolved" : "ongoing";
            const formattedDate = new Date(ticket.CreateAt).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={ticket.support_ticket_id}
                className="rounded-2xl p-6 bg-linear-to-br from-[#F8EAEE] via-[#F9F6FB] to-[#F8EAEE] shadow flex flex-col gap-2 relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        statusColor[uiStatus] || "bg-[#007AFF]"
                      }`}
                    ></span>
                    <span className="text-black font-medium text-base">
                      Ticket# {ticket.support_ticket_id}
                    </span>
                  </div>
                  <div className="text-black text-sm font-medium">
                    Posted at {formattedDate}
                  </div>
                </div>
                <div className="font-bold text-lg mb-1">
                  Support Ticket #{ticket.support_ticket_id}
                </div>
                <div className="text-black/80 text-base mb-2 line-clamp-2">
                  {ticket.question}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src="/assets/profile/user.svg"
                    alt="avatar"
                    className="w-7 h-7 rounded-full"
                  />
                  <span className="text-black/80 font-semibold text-base">
                    {ticket.Customer?.Name || "N/A"} -{" "}
                    {ticket.Customer?.phone || "N/A"}
                  </span>
                  <span
                    className="ml-auto text-primary-gradient font-semibold cursor-pointer"
                    onClick={() =>
                      navigate(`/settings/tickets/${ticket.support_ticket_id}`)
                    }
                  >
                    Open Ticket
                  </span>
                </div>
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <button
                    className={`flex items-center gap-2 px-4 py-1 rounded-lg font-semibold ${
                      statusBtnColor[uiStatus] || "bg-[#007AFF] text-white"
                    }`}
                    style={{ minWidth: 110 }}
                  >
                    <img
                      src={ongoingIconLight}
                      alt="status"
                      className="w-5 h-5"
                    />
                    {uiStatus === "resolved" ? "Resolved" : "On-Going"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SupportTickets;
