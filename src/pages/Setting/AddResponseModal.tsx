import React, { useRef, useState } from "react";
import { useCreateSupportTicketReplyMutation } from "@/redux/api/supportTicketsApi";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import uploadIcon from "@/assets/setting/upload.svg";
import { useTranslation } from "react-i18next";

interface AddResponseFormProps {
  onClose: () => void;
  onSubmit: (data: {
    /*subject: string;*/ message: string;
    images: File[];
  }) => void;
  ticketId?: string;
}

const AddResponseForm: React.FC<AddResponseFormProps> = ({
  onClose,
  onSubmit,
  ticketId,
}) => {
  // const [subject, setSubject] = useState('');
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const employeeIdFromStore = useSelector(
    (s: RootState) => s.auth.user?.Employee_id
  ) as number | undefined;
  const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages([...images, ...Array.from(e.target.files)]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Call mutation to create reply
    if (!ticketId) {
      // fallback to local callback
      onSubmit({ message, images });
      setMessage("");
      setImages([]);
      onClose();
      return;
    }
    const employeeId = employeeIdFromStore ?? 1;
    const payload = {
      support_ticket_id: Number(ticketId),
      reply: message,
      employee_id: employeeId,
      Ticket_status: "Process",
      Status: true,
    };

    createReply(payload)
      .unwrap()
      .then(() => {
        // pass back to parent
        onSubmit({ message, images });
        setMessage("");
        setImages([]);
        onClose();
      })
      .catch((err) => {
        // For now, show console error. Parent can show UI if needed.
        console.error("Failed to create reply", err);
      });
  };

  const [createReply, { isLoading: isCreating }] =
    useCreateSupportTicketReplyMutation();

  return (
    <div className="w-full max-w-2xl ml-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[#00000099] font-bold text-2xl cursor-pointer">
          {t("support.tickets.tabs.all")}
        </span>
        <span className="text-black font-bold text-2xl">
          {" "}
          &gt; {t("support.tickets.addResponse")}
        </span>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block font-semibold mb-2">
            {t("support.tickets.replyTitle")}
          </label>
          <textarea
            className="w-full border rounded-md px-4 py-3 min-h-[120px] text-black placeholder-black focus:outline-none"
            placeholder={t("supportTickets.createMessagePlaceholder")}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="mb-8">
          <label className="block font-semibold mb-2">
            {t("support.tickets.images.uploaded")}
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-1 rounded bg-linear-to-r from-[#6A1B9A] to-[#D32F2F] text-white font-semibold text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {t("support.tickets.images.upload")}
              <img
                src={uploadIcon}
                alt={t("support.tickets.images.upload")}
                className="w-5 h-5"
              />
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            {images.length > 0 && (
              <div className="ml-4 flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-gray-100 px-2 py-1 rounded text-xs text-black"
                  >
                    {img.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={isCreating}
            className="px-12 py-2 rounded-lg font-semibold text-white text-lg bg-linear-to-r from-[#D32F2F] to-[#6A1B9A] shadow disabled:opacity-50"
          >
            {isCreating ? t("actions.sending") : t("support.tickets.submit")}
          </button>
        </div>
        <div className="flex justify-center mt-4">
          <button
            type="button"
            className="text-[#6A1B9A]  font-semibold"
            onClick={onClose}
          >
            {t("actions.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddResponseForm;
