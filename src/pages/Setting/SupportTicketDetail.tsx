import React, { useState } from "react";
import headphoneIcon from "@/assets/setting/customer-service.svg";
import userIcon from "@/assets/profile/user.svg";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetSupportTicketByIdQuery,
  useGetSupportTicketRepliesQuery,
} from "@/redux/api/supportTicketsApi";
import AddResponseForm from "./AddResponseModal";
import { SuccessModal } from "@/components/common/SuccessModal";

const SupportTicketDetail: React.FC = () => {
  const { id: ticketId } = useParams();
  const navigate = useNavigate();
  const id = Number(ticketId ?? 0);
  const { data, isLoading, error } = useGetSupportTicketByIdQuery(id, {
    skip: !id,
  });
  const ticketData = data?.data;
  // Always declare replies hook (hooks must be called unconditionally)
  const { data: repliesData, isLoading: repliesLoading } =
    useGetSupportTicketRepliesQuery(id, { skip: !id });
  const [showAddResponse, setShowAddResponse] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (isLoading) {
    return <div className="p-8 text-center text-lg">Loading ticket...</div>;
  }
  if (error) {
    let errMsg = "Failed to load ticket";
    const e = error as unknown;
    if (typeof e === "object" && e !== null) {
      const maybe = e as { error?: string; data?: { message?: string } };
      if (typeof maybe.error === "string" && maybe.error.length > 0) {
        errMsg = maybe.error;
      } else if (maybe.data && typeof maybe.data.message === "string") {
        errMsg = maybe.data.message;
      }
    }
    return <div className="p-8 text-center text-lg text-red-600">{errMsg}</div>;
  }
  if (!ticketData) {
    return <div className="p-8 text-center text-lg">Ticket not found.</div>;
  }

  // Conversation item type
  type ConversationItem = {
    id: string | number;
    sender: "admin" | "employee" | string;
    name: string;
    message?: string;
    icon?: string;
    time?: string;
    attachment?: string;
  };

  // Build conversation: first ticket message, then replies (if available)
  const conversation: ConversationItem[] = [];
  conversation.push({
    id: `ticket-${ticketData.support_ticket_id}`,
    sender: "employee",
    name: ticketData.Customer?.Name || ticketData.CreateBy?.Name || "Customer",
    message: ticketData.question,
    icon: userIcon,
    time: new Date(ticketData.CreateAt).toLocaleString(),
  });

  if (repliesData && Array.isArray(repliesData.data)) {
    const replies = repliesData.data;
    replies.forEach((reply, idx) => {
      conversation.push({
        id: reply.support_ticket_reply_id ?? `reply-${idx}`,
        sender: reply.Employee ? "admin" : "employee",
        name: reply.Employee?.Name || reply.CreateBy?.Name || "Support",
        message: reply.reply,
        icon: headphoneIcon,
        time: reply.CreateAt
          ? new Date(String(reply.CreateAt)).toLocaleString()
          : "",
      });
    });
  }

  // Safe subject string: prefer SupportTicketType.subject if present and a string,
  // otherwise fallback to the ticket question.
  let subjectText = ticketData.question;
  if (
    ticketData.SupportTicketType &&
    typeof ticketData.SupportTicketType === "object"
  ) {
    const maybe = ticketData.SupportTicketType as Record<string, unknown>;
    if (typeof maybe["subject"] === "string") {
      subjectText = maybe["subject"];
    }
  }

  const handleAddResponse = () => setShowAddResponse(true);
  const handleCloseAddResponse = () => setShowAddResponse(false);
  const handleSubmitResponse = (data: { message: string; images: File[] }) => {
    // For now, just log the data
    console.log("Submitted response:", data);
    setShowAddResponse(false);
    setShowSuccess(true);
  };

  const handleSuccessButton = () => {
    setShowSuccess(false);
    navigate("/settings/tickets");
  };

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {showAddResponse ? (
        <div className="max-w-2xl mx-auto">
          {/* Only the Add Response header and form, no ticket summary or other header */}
          <AddResponseForm
            onClose={handleCloseAddResponse}
            onSubmit={handleSubmitResponse}
            ticketId={String(ticketData.support_ticket_id)}
          />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center gap-2 mb-8">
            <span className="text-[#00000099] font-bold text-[32px]">
              Support Ticket &gt;
            </span>
            <span className="text-black font-bold text-[32px]">All Ticket</span>
          </div>
          {/* Ticket Summary */}
          <div className="rounded-2xl bg-[#F8EAEE] p-8 flex flex-col md:flex-row md:justify-between mb-8">
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="font-bold">Requestor</span>
                <span className="font-bold">
                  {ticketData.Customer?.Name ||
                    ticketData.CreateBy?.Name ||
                    "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Subject</span>
                <span className="font-bold">{subjectText}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Created on</span>
                <span className="font-bold">
                  {new Date(ticketData.CreateAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Ticket ID</span>
                <span className="font-bold">
                  {ticketData.support_ticket_id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Ticket Status</span>
                <span className="font-bold text-[#F8A534]">
                  {ticketData.Ticket_status === "Pending" ||
                  ticketData.Ticket_status === "Process"
                    ? "Ongoing"
                    : ticketData.Ticket_status === "Resolved"
                    ? "Resolved"
                    : ticketData.Ticket_status}
                </span>
              </div>
            </div>
          </div>
          {/* Conversation */}
          <div className="flex flex-col gap-6">
            {/* Ticket message (first item) */}
            {conversation[0] && (
              <div
                key={conversation[0].id}
                className={`w-full rounded-xl border ${
                  conversation[0].sender === "admin"
                    ? "bg-[#F8EAEE]"
                    : "bg-white"
                } p-4 flex flex-col gap-2 shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {conversation[0].sender === "admin" && (
                    <img
                      src={conversation[0].icon}
                      alt="icon"
                      className="w-5 h-5"
                    />
                  )}
                  <span className="font-bold text-base">
                    {conversation[0].name}
                  </span>
                </div>
                <div className="text-black font-normal text-base">
                  {conversation[0].message}
                </div>
                <div className="mt-2">
                  <img
                    src={userIcon}
                    alt="attachment"
                    className="w-8 h-8 rounded bg-[#E5E5E5]"
                  />
                </div>
              </div>
            )}

            {/* Replies area: skeletons while loading, then replies */}
            {repliesLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-full rounded-xl p-4 bg-white/30 shadow flex flex-col gap-2 animate-pulse"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gray-300" />
                      <div className="h-4 w-40 bg-gray-300 rounded" />
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              // render replies (slice off the first ticket message)
              conversation.slice(1).map((msg) => (
                <div
                  key={msg.id}
                  className={`w-full rounded-xl border ${
                    msg.sender === "admin" ? "bg-[#F8EAEE]" : "bg-white"
                  } p-4 flex flex-col gap-2 shadow-sm`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {msg.sender === "admin" && (
                      <img src={msg.icon} alt="icon" className="w-5 h-5" />
                    )}
                    <span className="font-bold text-base">{msg.name}</span>
                  </div>
                  <div className="text-black font-normal text-base">
                    {msg.message}
                  </div>
                  <div className="mt-2">
                    <img
                      src={userIcon}
                      alt="attachment"
                      className="w-8 h-8 rounded bg-[#E5E5E5]"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Add Response Button */}
          <div className="flex justify-center mt-10">
            <button
              className="px-12 py-2 rounded-lg font-semibold text-white text-lg bg-linear-to-r from-[#D32F2F] to-[#6A1B9A] shadow"
              onClick={handleAddResponse}
            >
              Add Response
            </button>
          </div>
        </>
      )}
      <SuccessModal
        open={showSuccess}
        title="Ticket Response Added Successful !"
        subtitle="Your response has been added to the support ticket."
        buttonText="View All Tickets"
        onButtonClick={handleSuccessButton}
      />
    </div>
  );
};

export default SupportTicketDetail;
