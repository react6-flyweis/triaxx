import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useOrderStore } from "@/store/zustandStores";
import printIcon from "@/assets/order/Print.svg";
import type { Order } from "@/types/order";
import PrintBillModal from "@/components/common/PrintBillModal";

const Invoice = ({ onBack }: { onBack?: () => void }) => {
  const { orders, fetchOrders } = useOrderStore();
  const { t } = useTranslation();
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState("Today");
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between gap-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-700 whitespace-nowrap">
          <span className="cursor-pointer" onClick={onBack}>
            {t("orderHistory.title")}{" "}
          </span>
          <span className="font-bold text-black">
            &gt; {t("orderHistory.invoice.title")}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="bg-[#F1F1F1] p-2 rounded-full">
              <button
                className="px-6 py-2 rounded-full font-medium bg-white text-black flex items-center gap-2"
                onClick={() => setShowDateDropdown((v) => !v)}
              >
                {(() => {
                  // display localized label for current dateFilter value
                  const map: Record<string, string> = {
                    Today: "today",
                    Yesterday: "yesterday",
                    "This week": "thisWeek",
                    "This Month": "thisMonth",
                  };
                  const key = map[dateFilter] || "allTime";
                  return t(`orderHistory.dateFilter.${key}`);
                })()}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
            {showDateDropdown && (
              <div className="absolute -left-4 -mt-14 w-44 bg-white rounded-lg shadow-lg z-10 p-2">
                {["Today", "Yesterday", "This week", "This Month"].map(
                  (option) => (
                    <button
                      key={option}
                      className="block w-full text-left px-4 py-1 hover:bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]"
                      onClick={() => {
                        setDateFilter(option);
                        setShowDateDropdown(false);
                        fetchOrders({ dateRange: option });
                      }}
                    >
                      {(() => {
                        const mapping: Record<string, string> = {
                          Today: "today",
                          Yesterday: "yesterday",
                          "This week": "thisWeek",
                          "This Month": "thisMonth",
                        };
                        const key = mapping[option] || "allTime";
                        return t(`orderHistory.dateFilter.${key}`);
                      })()}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className="rounded-t-2xl border overflow-x-auto"
        style={{
          background:
            "linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)",
          borderColor: "#00000033",
        }}
      >
        <table className="min-w-full text-left">
          <thead>
            <tr
              className="text-[#00000099] text-base font-semibold px-2 "
              style={{}}
            >
              <th className="py-4 px-4">
                {t("orderHistory.invoice.tableHeaders.sNo")}
              </th>
              <th className="py-4 px-4">
                {t("orderHistory.invoice.tableHeaders.invoiceId")}
              </th>
              <th className="py-4 px-4">
                {t("orderHistory.invoice.tableHeaders.date")}
              </th>
              <th className="py-4 px-4">
                {t("orderHistory.invoice.tableHeaders.orderType")}
              </th>
              <th className="py-4 px-4">
                {t("orderHistory.invoice.tableHeaders.totalAmount")}
              </th>
              <th className="py-4 px-4">
                {t("orderHistory.invoice.tableHeaders.action")}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr
                key={order.orderId || idx}
                className="bg-white border-b  border"
                style={{ borderColor: "#00000033" }}
              >
                <td className="py-4 px-4 text-[16px] font-semibold text-black">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="py-4 px-4 text-[16px] font-semibold text-black">
                  {order.orderId}
                </td>
                <td className="py-4 px-4 text-[16px] font-semibold text-black">
                  {order?.createdAt
                    ? new Date(order?.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </td>
                <td className="py-4 px-4 text-[16px] font-semibold text-black">
                  {order.orderType || t("orderHistory.invoice.dineIn")}
                </td>
                <td className="py-4 px-4 text-[16px] font-semibold text-black">
                  {order.pricingSummary?.totalAmount?.toLocaleString() || ""}{" "}
                  XOF
                </td>
                <td className="py-4 px-4 text-[16px] font-semibold text-black">
                  <button
                    className="flex items-center gap-1 text-black hover:text-primary-gradient"
                    onClick={() => setPrintOrder(order)}
                  >
                    <img
                      src={printIcon}
                      alt={t("orderHistory.invoice.print")}
                    />{" "}
                    {t("orderHistory.invoice.print")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PrintBillModal
        open={!!printOrder}
        onClose={() => setPrintOrder(null)}
        order={printOrder}
      />
    </div>
  );
};

export default Invoice;
