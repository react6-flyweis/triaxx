import React, { useRef, useEffect, useState } from "react";
import { useSupportTicketStore } from "@/store/zustandStores";
import { useUserStore } from "@/store/zustandStores";
import { useNavigate } from "react-router-dom";
import uploadImage from "@/assets/setting/upload.svg";
import {
  useGetSupportTicketTypesQuery,
  useCreateSupportTicketMutation,
} from "@/redux/api/supportTicketsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

const CreateSupportTicket: React.FC = () => {
  const {
    email,
    businessName,
    subject,
    message,
    images,
    ticketNumber,
    setField,
    setImages,
    fetchTicketId,
  } = useSupportTicketStore();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const userLoading = useUserStore((s) => s.loading);
  const customerId = useSelector((s: RootState) => s.auth.user?.user_id) as
    | number
    | undefined;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<
    number | null
  >(null);

  // Fetch ticket types
  const { data: ticketTypesData, isLoading: typesLoading } =
    useGetSupportTicketTypesQuery();
  const [createTicket, { isLoading: createLoading, error: createError }] =
    useCreateSupportTicketMutation();

  // Fetch ticket ID automatically on mount if not present
  useEffect(() => {
    if (!ticketNumber) {
      fetchTicketId();
    }
  }, [ticketNumber, fetchTicketId]);

  // Prefill email and businessName from user if undefined or null and user is loaded
  useEffect(() => {
    if (user && (email === undefined || email === null)) {
      setField("email", user.email);
    }
    if (user && (businessName === undefined || businessName === null)) {
      setField("businessName", user.name);
    }
  }, [user, email, businessName, setField]);

  // Auto-select first ticket type if available
  useEffect(() => {
    if (
      ticketTypesData?.data &&
      ticketTypesData.data.length > 0 &&
      !selectedTicketTypeId
    ) {
      setSelectedTicketTypeId(ticketTypesData.data[0].support_ticket_type_id);
    }
  }, [ticketTypesData, selectedTicketTypeId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketTypeId) {
      alert("Please select a ticket type");
      return;
    }
    if (!customerId) {
      alert("User not authenticated");
      return;
    }

    try {
      await createTicket({
        support_ticket_type_id: selectedTicketTypeId,
        question: `${subject}\n\n${message}`,
        customer_id: customerId,
        Ticket_status: "Pending",
        Status: true,
      }).unwrap();
      navigate("/settings/tickets");
    } catch (err) {
      console.error("Failed to create ticket:", err);
    }
  };

  if (userLoading || !user || !ticketNumber) {
    return <div className="p-8 text-center text-lg">Loading...</div>;
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span
          className="text-[#00000099] font-bold text-[32px] cursor-pointer"
          onClick={() => navigate(-1)}
        >
          Support Ticket
        </span>
        <span className="text-black font-bold text-[32px]">
          &gt; Create Support Ticket
        </span>
      </div>
      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl shadow bg-linear-to-br from-[#F8EAEE] via-[#F9F6FB] to-[#F8EAEE] p-8 md:p-12 max-w-5xl mx-auto relative"
        style={{ minHeight: 420 }}
      >
        {/* Ticket# and posted time */}
        <div className="flex justify-between mb-6">
          <div className="text-black font-medium text-base">
            Ticket# {ticketNumber}
          </div>
          <div className="text-black text-sm font-medium">
            Posted at{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        {/* Email & Business Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-black font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-md px-4 py-2 bg-[#F9F9F9] text-black/80 focus:outline-none"
              value={email ?? ""}
              onChange={(e) => setField("email", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-black font-medium mb-1">
              Business Name
            </label>
            <input
              type="text"
              className="w-full border rounded-md px-4 py-2 bg-[#F9F9F9] text-black/80 focus:outline-none"
              value={businessName ?? ""}
              onChange={(e) => setField("businessName", e.target.value)}
              required
            />
          </div>
        </div>
        {/* Ticket Type Selector */}
        <div className="mb-6">
          <label className="block text-black font-medium mb-1">
            Ticket Type
          </label>
          <select
            className="w-full border rounded-md px-4 py-2 bg-[#F9F9F9] text-black/80 focus:outline-none"
            value={selectedTicketTypeId ?? ""}
            onChange={(e) => setSelectedTicketTypeId(Number(e.target.value))}
            required
            disabled={typesLoading}
          >
            <option value="" disabled>
              {typesLoading
                ? "Loading ticket types..."
                : "Select a ticket type"}
            </option>
            {ticketTypesData?.data?.map((type) => (
              <option
                key={type.support_ticket_type_id}
                value={type.support_ticket_type_id}
              >
                {type.Name}
              </option>
            ))}
          </select>
        </div>
        {/* Reply Ticket - Subject and Body */}
        <h2 className="text-[#2E2A40] ">Reply Ticket</h2>
        <div className="mb-6 border rounded">
          <input
            type="text"
            className="w-full rounded-md px-4 pt-2 m-0  text-black placeholder-black focus:outline-none"
            placeholder="Enter Subject..."
            value={subject ?? ""}
            onChange={(e) => setField("subject", e.target.value)}
            required
          />
          <textarea
            className="w-full  rounded-md px-4 py-2 min-h-[100px]   text-[#00000080] focus:outline-none resize-none"
            placeholder="Explain here..."
            value={message ?? ""}
            onChange={(e) => setField("message", e.target.value)}
            required
          />
        </div>
        {/* Image Upload */}
        <div className="mb-8">
          <label className="block text-black font-medium mb-1">
            Images Uploaded
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-linear-to-t from-[#D32F2F] to-[#6A1B9A] text-white font-semibold flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Img
              <img src={uploadImage} alt="upload" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            {images && images.length > 0 && (
              <span className="text-black/80 text-sm">
                {images.map((f) => f.name).join(", ")}
              </span>
            )}
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            className="px-16 py-2 rounded-lg font-semibold text-white text-lg bg-linear-to-t from-[#D32F2F] to-[#6A1B9A] shadow disabled:opacity-60"
            disabled={createLoading}
          >
            {createLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
        {createError && (
          <div className="text-red-600 mt-4 text-center">
            {typeof createError === "object" && "data" in createError
              ? String(
                  (createError as { data?: { message?: string } }).data
                    ?.message || "Failed to create ticket"
                )
              : "Failed to create ticket"}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateSupportTicket;
