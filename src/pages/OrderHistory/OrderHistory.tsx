import { useState, useEffect } from "react";
import {
  useGetAllOrderHistoryQuery,
  useGetOrderHistoryByDateRangeQuery,
  useGetOrderHistoryByStatusQuery,
} from "@/redux/api/orderHistoryApi";
import OrderSummaryModal from "@/components/common/OrderSummaryModal";
import PaymentModal from "@/components/common/PaymentModal";
import { SuccessModal } from "@/components/common/SuccessModal";
import Invoice from "./Invoice";
import type { OrderItem } from "@/types/order";
import cutleryIcon from "@/assets/order/cutlery.svg";
import preparingIcon from "@/assets/order/preparing.svg";
import checkIcon from "@/assets/payment/success_tick_receipt.svg"; // for served
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { teamChatTrainingSteps } from "@/walkthrough/steps";
import * as orderApi from "@/api/orderApi";
import Loader from "@/components/Loader";

function getMinutesAgo(isoString: string | undefined) {
  if (!isoString) return "";
  const diffMs = Date.now() - new Date(isoString).getTime();
  return Math.max(1, Math.round(diffMs / 60000)); // at least 1 min
}

const getStatusBadge = ({ order, t }: { order: any; t: any }) => {
  // Find the latest status change for the current status
  const lastStatus =
    order.statusHistory && order.statusHistory.length > 0
      ? order.statusHistory[order.statusHistory.length - 1]
      : undefined;
  const minutes = getMinutesAgo(lastStatus?.at);

  if (order.status === "Preparing") {
    return (
      <span className="bg-[#FFE3BC] text-[#FF9500] px-3 py-2 min-h-[50px] rounded-2xl text-xs font-semibold flex flex-col items-center gap-1">
        <span>
          {order?.status}
          <img
            src={preparingIcon}
            alt="Clock"
            className="w-4 h-4 inline ml-1"
          />
        </span>
        <span className="text-black">
          {" "}
          {minutes} {t("orderHistory.minLabel")}
        </span>
      </span>
    );
  }
  if (order.status === "Served") {
    return (
      <span className="bg-[#34C7594D] text-green-700 px-3 py-2 rounded-2xl min-h-[50px] text-xs font-semibold flex items-center gap-1">
        {order.status}
        <img src={checkIcon} alt="Check" className="w-4 h-4 inline ml-1" />
      </span>
    );
  }
  if (order.status === "Cancelled") {
    return (
      <span className="bg-[#C518004D] text-red-700 px-3 py-2 min-h-[50px] rounded-2xl text-xs font-semibold flex flex-col items-center gap-1">
        <span>{order?.status}</span>
        <span className="text-black">
          {" "}
          {minutes} {t("orderHistory.minLabel")}
        </span>
      </span>
    );
  }
  return (
    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
      {order.status}
    </span>
  );
};

const getDateRange = (filter: string) => {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  if (filter === "Today") {
    const td = formatDate(today);
    return { start_date: td, end_date: td };
  } else if (filter === "Last Week") {
    const start = new Date(today);
    start.setDate(start.getDate() - 7);
    return { start_date: formatDate(start), end_date: formatDate(today) };
  } else if (filter === "Last Month") {
    const start = new Date(today);
    start.setDate(start.getDate() - 30);
    return { start_date: formatDate(start), end_date: formatDate(today) };
  }
  return null;
};

const OrderHistory = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Filter and tab logic
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState("Today");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const {
    steps,
    currentStep,
    isActive,
    next,
    completed,
    activeTraining,
    completedTrainings,
    startTraining,
  } = useWalkthroughStore();

  const dateRange = getDateRange(dateFilter);
  const page = 1;
  const limit = 100; // Fetch more to allow client-side filtering

  const skipDate = !dateRange;
  const skipStatus = statusFilter === "" || !!dateRange;
  const skipAll = !!dateRange || statusFilter !== "";

  const {
    data: rangeData,
    isLoading: rangeLoading,
    isError: rangeError,
    refetch: rangeRefetch,
  } = useGetOrderHistoryByDateRangeQuery(
    {
      start_date: dateRange?.start_date,
      end_date: dateRange?.end_date,
      page,
      limit,
    },
    { skip: skipDate }
  );

  const {
    data: statusData,
    isLoading: statusLoading,
    isError: statusError,
    refetch: statusRefetch,
  } = useGetOrderHistoryByStatusQuery(
    { status: statusFilter, page, limit },
    { skip: skipStatus }
  );

  const {
    data: allData,
    isLoading: allLoading,
    isError: allError,
    refetch: allRefetch,
  } = useGetAllOrderHistoryQuery(
    {
      page,
      limit,
      search: "",
      order_status: "",
      client_mobile_no: "",
      table_id: "",
      floor_id: "",
    },
    { skip: skipAll }
  );

  let data;
  let isLoading;
  let isError;
  let activeRefetch;
  isLoading = allLoading || rangeLoading || statusLoading;
  if (!skipDate) {
    data = rangeData;
    isLoading = rangeLoading;
    isError = rangeError;
    activeRefetch = rangeRefetch;
  } else if (!skipStatus) {
    data = statusData;
    isLoading = statusLoading;
    isError = statusError;
    activeRefetch = statusRefetch;
  } else {
    data = allData;
    isLoading = allLoading;
    isError = allError;
    activeRefetch = allRefetch;
  }

  // Chain to teamchat training after orderHistory training completes
  useEffect(() => {
    if (
      completed &&
      activeTraining === "orderHistory" &&
      !completedTrainings.teamchat
    ) {
      startTraining("teamchat", teamChatTrainingSteps);
      navigate("/");
    }
  }, [completed, activeTraining, completedTrainings, startTraining, navigate]);

  if (activeTab === "invoices") {
    return <Invoice onBack={() => setActiveTab("orders")} />;
  }

  let orders = data?.data?.orders || [];
  let timePeriod = dateFilter ? dateFilter.toLowerCase() : "all time";

  if (!skipDate && statusFilter) {
    // Client-side filter for status when using date range
    orders = orders.filter((o: any) => o.order.order_status === statusFilter);
  }

  return (
    <div className="p-8 min-h-screen">
      <div className="flex items-center justify-between gap-6 mb-8">
        <h1 className="text-2xl font-bold whitespace-nowrap">
          {t("orderHistory.title")}
        </h1>
        <div className="flex gap-3 items-center">
          <button
            className={`px-6 py-1 h-10 rounded-lg font-semibold bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white shadow`}
            onClick={() => setActiveTab("invoices")}
          >
            {t("orderHistory.invoices")}
          </button>
          <div className="flex items-center gap-2 rounded-full px-2 py-1">
            {/* Date Filter */}
            <div className="relative">
              <div className="bg-[#F1F1F1] p-2 rounded-full">
                <button
                  className={`px-6 py-2 rounded-full font-medium bg-white text-black flex items-center gap-2 order-history-date-filter`}
                  onClick={() => {
                    setShowDateDropdown((v) => !v);
                    const step = steps[currentStep];
                    if (
                      isActive &&
                      step &&
                      step.selector === ".order-history-date-filter"
                    ) {
                      next();
                    }
                  }}
                >
                  {dateFilter || t("orderHistory.dateFilter.allTime")}
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
                <div className="order-history-date-dropdown absolute -left-4 -mt-14 w-44 bg-white rounded-lg shadow-lg z-10 p-2">
                  {["Today", "Last Week", "Last Month", "Reset"].map(
                    (option) => (
                      <button
                        key={option}
                        className="block w-full text-left px-4 py-1 hover:bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F]"
                        onClick={() => {
                          if (option === "Reset") {
                            setDateFilter("");
                          } else {
                            setDateFilter(option);
                          }
                          setShowDateDropdown(false);
                        }}
                      >
                        {(() => {
                          const map: Record<string, string> = {
                            Today: t("orderHistory.dateFilter.today"),
                            "Last Week": t("orderHistory.dateFilter.lastWeek"),
                            "Last Month": t(
                              "orderHistory.dateFilter.lastMonth"
                            ),
                            Reset: t("orderHistory.dateFilter.reset"),
                          };
                          return map[option] || option;
                        })()}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
            {/* Status Filters */}
            <div className="flex items-center gap-1 bg-[#F1F1F1] rounded-full px-2 py-1">
              {["All", "Preparing", "Served", "Cancelled"].map((option) => (
                <button
                  key={option}
                  className={`px-5 py-2 rounded-full font-medium ${
                    (option === "All" && statusFilter === "") ||
                    (option !== "All" && statusFilter === option)
                      ? "bg-white text-black shadow"
                      : "bg-transparent text-black"
                  }`}
                  onClick={() => {
                    if (option === "All") {
                      setStatusFilter("");
                    } else {
                      setStatusFilter(option);
                    }
                  }}
                >
                  {(() => {
                    const m: Record<string, string> = {
                      All: t("orderHistory.statusOptions.all"),
                      Preparing: t("orderHistory.statusOptions.preparing"),
                      Served: t("orderHistory.statusOptions.served"),
                      Cancelled: t("orderHistory.statusOptions.cancelled"),
                    };
                    return m[option] || option;
                  })()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <Loader />
      ) : isError || orders.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400 mb-2">
              {statusFilter
                ? t("orderHistory.empty.headingStatus", {
                    status: statusFilter.toLowerCase(),
                    period: timePeriod,
                  })
                : t("orderHistory.empty.headingDefault", {
                    period: timePeriod,
                  })}
            </div>
            <div className="text-sm text-gray-500">
              {statusFilter
                ? t("orderHistory.empty.subtitleStatus", {
                    status: statusFilter.toLowerCase(),
                  })
                : t("orderHistory.empty.subtitleDefault")}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-scroll ">
          {orders.map((order: any, idx: any) => (
            <div
              key={order.order.order_id || idx}
              className="bg-white flex flex-col justify-between rounded-2xl shadow-lg p-0 cursor-pointer hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              onClick={() => {
                setSelectedOrder({
                  orderId: order.order.order_id,
                  status: order.order.order_status,
                  statusHistory: [{ at: order.order.created_at }],
                  tableInfo: { tableId: `t-${order.table.table_id}` },
                  items: order.products.items,
                  pricingSummary: {
                    taxPercentage: order.tax.tax_percentage,
                    tax: order.tax.tax_amount,
                    subtotal: order.subtotal,
                    totalAmount: order.total,
                  },
                  customerInfo: { name: "" }, // Placeholder
                  paymentDetails: { method: "Cash" }, // Placeholder
                });
                setShowSummaryModal(true);
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-2 m-4 rounded-xl"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)",
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex gap-2">
                    <img src={cutleryIcon} alt="Order" className="w-5 h-5" />
                    <span className="font-bold text-lg">
                      # {order.order.order_id}
                    </span>
                  </div>
                  <div className="font-bold text-sm">
                    {t("orderHistory.tableLabel", { id: order.table.table_id })}
                  </div>
                  <div className="text-sm font-normal">
                    {t("orderHistory.itemCount", {
                      count: order.products.items.length,
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {getStatusBadge({
                    order: {
                      orderId: order.order.order_id,
                      status: order.order.order_status,
                      statusHistory: [{ at: order.order.created_at }],
                      tableInfo: { tableId: `t-${order.table.table_id}` },
                      items: order.products.items,
                      pricingSummary: {
                        taxPercentage: order.tax.tax_percentage,
                        tax: order.tax.tax_amount,
                        subtotal: order.subtotal,
                        totalAmount: order.total,
                      },
                      customerInfo: { name: "" },
                      paymentDetails: { method: "Cash" },
                    },
                    t,
                  })}
                </div>
              </div>
              {/* Table and items */}
              <div className="px-4 pt-2 pb-1">
                {/* Items */}
                <div className="mb-2">
                  {order.products.items.map((item: any, i: any) => (
                    <div
                      key={item.item_id + i}
                      className="flex justify-between text-sm mb-1"
                    >
                      <span className="text-sm font-normal">
                        {item.quantity || 1} x {item.name}
                      </span>
                      <span className="font-bold text-xs">
                        {item.price.toLocaleString()} XOF
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Summary */}
              <div className="bg-[#F2F2F7] px-4 py-3 rounded-b-2xl border-t border-dashed border-[#5D5757]">
                <div className="flex justify-between text-xm text-[#5A5A5A] mb-1">
                  <span>
                    {t("orderHistory.taxLabel", {
                      rate: order.tax.tax_percentage,
                    })}
                  </span>
                  <span>RM {(order.tax.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm">
                  <span>{t("orderHistory.subtotal")}</span>
                  <span>RM {(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedOrder && (
        <OrderSummaryModal
          open={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          order={{
            items: selectedOrder.items,
            subtotal: selectedOrder.pricingSummary?.subtotal || 0,
            tax: selectedOrder.pricingSummary?.tax || 0,
            total: selectedOrder.pricingSummary?.totalAmount || 0,
            orderId: selectedOrder.orderId,
            paymentType: selectedOrder.paymentDetails?.method || "Cash",
            customerName: selectedOrder.customerInfo?.name || "",
          }}
          onUpdateItemQuantity={async (itemId, newQty) => {
            if (selectedOrder?.orderId) {
              const updatedItems = selectedOrder.items.map((item: OrderItem) =>
                item.itemId === itemId ? { ...item, quantity: newQty } : item
              );

              const subtotal = updatedItems.reduce(
                (sum: number, item: OrderItem) => {
                  const addOnsTotal =
                    (item.addOns?.reduce(
                      (a: number, addon) => a + (addon.price || 0),
                      0
                    ) || 0) * (item.quantity || 1);
                  return sum + item.price * (item.quantity || 1) + addOnsTotal;
                },
                0
              );
              const tax = Math.round(subtotal * 0.06);
              const total = subtotal + tax;

              await orderApi.updateOrder(selectedOrder.orderId, {
                items: updatedItems,
                pricingSummary: {
                  subtotal,
                  tax,
                  taxPercentage: 6,
                  discount: 0,
                  serviceCharge: 0,
                  totalAmount: total,
                },
              });

              setSelectedOrder({
                ...selectedOrder,
                items: updatedItems,
                pricingSummary: {
                  ...selectedOrder.pricingSummary,
                  subtotal,
                  tax,
                  totalAmount: total,
                },
              });
            }
          }}
          onChoosePaymentOption={() => {
            setShowSummaryModal(false);
            setShowPaymentModal(true);
          }}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={selectedOrder?.pricingSummary?.totalAmount || 0}
        onConfirm={async (method) => {
          if (selectedOrder?.orderId) {
            await orderApi.updateOrder(selectedOrder.orderId, {
              paymentDetails: {
                method,
                status: "Paid",
                transactionId: `TXN-${Date.now()}`,
              },
            });
            setShowPaymentModal(false);
            setShowSuccessModal(true);
          }
        }}
      />

      <SuccessModal
        open={showSuccessModal}
        title={t("orderHistory.success.paymentReceivedTitle")}
        subtitle={t("orderHistory.success.paymentReceivedSubtitle")}
        buttonText={t("orderHistory.success.backButton")}
        onButtonClick={() => {
          setShowSuccessModal(false);
          setShowSummaryModal(false);
          activeRefetch();
        }}
      />
    </div>
  );
};

export default OrderHistory;
