/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetTablesByFloorQuery } from "@/redux/api/tablesApi";
import type { BackendTableItem, BackendTablesFlattened } from "@/types/table";
import { TableIcon } from "@/icons/TableIcon";
import { useGetTableBookingStatusesQuery } from "@/redux/api/tablesApi";
import OrderSummaryModal from "@/components/common/OrderSummaryModal";
import PaymentModal from "@/components/common/PaymentModal";
import { SuccessModal } from "@/components/common/SuccessModal";
import * as orderApi from "@/api/orderApi";
import type { OrderItem } from "@/types/order";
import editIcon from "@/assets/table/edit.svg";
// import CheckmarkIcon from "@/icons/CheckmarkIcon";
// import ReadyDishIcon from "@/icons/ReadyDishIcon";
// import TimerIcon from "@/icons/ClockIcon";
import { useOrderFlowStore } from "@/store/zustandStores";
import EditFloorPlan from "@/components/common/EditFloorPlan";
import { useTranslation } from "react-i18next";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { orderHistoryTrainingSteps } from "@/walkthrough/steps";

// const statusTabs = [
//   { label: "All Tables", value: "all" },
//   { label: "Served", value: "Served" },
//   { label: "Waiting", value: "Waiting" },
//   { label: "Reserved", value: "Reserved" },
//   // { label: "Ready", value: "Ready" },
//   // { label: "Occupied", value: "Occupied" },
// ];

// const statusIconMap: Record<string, React.ReactNode> = {
//   Served: <CheckmarkIcon width={20} height={20} />,
//   Ready: <ReadyDishIcon width={20} height={20} />,
//   Waiting: <TimerIcon width={20} height={20} />,
//   // Add more mappings as needed
// };

// Status color mapping for TableIcon
const statusStyleMap: Record<string, { color: string; textColor: string }> = {
  Served: { color: "#34C7594D", textColor: "#34C759" },
  Reserved: { color: "#A579D14D", textColor: "#A579D1" },
  // Cleaning: { color: "#DBEAFE", textColor: "#2563EB" },
  Occupied: { color: "#FECACA", textColor: "#B91C1C" },
  Waiting: { color: "#FEF3C7", textColor: "#B45309" },
  Available: { color: "#E5E7EB", textColor: "#6B7280" },
  Ready: { color: "#FFE3BC", textColor: "#FEC002" },
};

// Helper: group tables by row number provided by server (Row_No)
function groupTablesByRow(tables: BackendTablesFlattened) {
  const rowMap: Record<string, BackendTablesFlattened> = {};
  tables.forEach((table) => {
    const row = table.rowNo !== undefined ? String(table.rowNo) : "1";
    if (!rowMap[row]) rowMap[row] = [];
    rowMap[row].push(table);
  });
  const sortedRows = Object.keys(rowMap).sort((a, b) => Number(a) - Number(b));
  return sortedRows.map((row) => ({
    row,
    tables: rowMap[row],
  }));
}

// Normalize server booking status to frontend-friendly keys used in UI
// const normalizeStatus = (raw?: string) => {
//   if (!raw) return "Available";
//   const s = raw.toLowerCase();
//   if (s.includes("empty")) return "Available";
//   if (s.includes("served")) return "Served";
//   if (s.includes("waiting")) return "Waiting";
//   if (s.includes("ready")) return "Ready";
//   if (s.includes("reserved") || s.includes("book")) return "Reserved";
//   return "Available";
// };

const TableCard = ({
  table,
  onClick,
}: {
  table: BackendTableItem & { floorName?: string; rowNo?: number };
  onClick: () => void;
}) => {
  const capacity =
    table["Seating-Persons_Count"] || table["Seating_Persons_Count"] || 2;
  let size: "small" | "medium" | "long" = "small";
  if (capacity === 4) size = "medium";
  if (capacity === 8) size = "long";

  const status = table["Table-Booking-Status_id"]?.Name || "";
  // const icon =
  //   status && statusIconMap[status] ? statusIconMap[status] : undefined;
  const statusObj =
    status && status !== "Available"
      ? { text: status, ...(statusStyleMap[status] || {}) }
      : undefined;
  const label = table["Table-code"] || ""; // name ,code
  return (
    <div
      className={`flex flex-col items-center justify-center cursor-pointer mx-2 my-2  relative min-w-fit${
        status === "Available" || status === "Empty" ? " table-available" : ""
      }`}
      onClick={onClick}
    >
      <TableIcon
        size={size}
        label={label}
        status={statusObj}
        // icon={icon}
        timer={(table as any).timer}
      />
      {/* Show timer for Waiting tables */}
      {/* {table.status === 'Waiting' && table.timer !== undefined && (
      <div className="text-xs font-semibold text-[#B45309] mt-1">
        {table.timer} min
      </div>
      )} */}
    </div>
  );
};

const TablePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const startOrder = useOrderFlowStore((s) => s.startOrder);
  // Use RTK Query to fetch tables by floor
  const [activeTab, setActiveTab] = useState("all");
  const [orderSummary, setOrderSummary] = useState<any | null>(null);
  const [orderSummaryOpen, setOrderSummaryOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const floor = useOrderFlowStore((s) => s.floor);
  const persons = useOrderFlowStore((s) => s.persons);

  const {
    data: tablesResp,
    isLoading: isLoadingTables,
    refetch,
  } = useGetTablesByFloorQuery(floor || 1);
  const { data: statusesResp } = useGetTableBookingStatusesQuery();
  // const currentOrder = useOrderFlowStore((s) => s.currentOrder);
  const isInOrderFlow = useOrderFlowStore((s) => s.isInOrderFlow);
  const { completed, activeTraining, startTraining, reset } =
    useWalkthroughStore();

  // data is provided by RTK Query hook `tablesResp`

  useEffect(() => {
    if (completed && activeTraining === "table") {
      reset();
      setTimeout(() => {
        startTraining("orderHistory", orderHistoryTrainingSteps);
        navigate("/");
      }, 50);
    }
  }, [completed, activeTraining, startTraining, reset, navigate]);

  // Flatten server rows into table list with rowNo and floorName attached
  const serverTables: BackendTablesFlattened = tablesResp?.data
    ? Object.values(tablesResp.data).flatMap((row: any) =>
        (row.tables || []).map((t: BackendTableItem) => ({
          ...t,
          floorName: row.Floor?.Floor_Name,
          rowNo: row.Row_No,
        }))
      )
    : [];

  const availableStatusNames = statusesResp?.data?.map((s) => s.Name) || [];

  const statusTabs = [
    { label: t("tables.statusTabs.all"), value: "all" },
    ...availableStatusNames.map((n: string) => ({ label: n, value: n })),
  ];

  const filteredTables =
    activeTab === "all"
      ? serverTables
      : serverTables.filter((t) => {
          const raw =
            t["Table-Booking-Status_id"]?.Name ||
            t["Table-Booking-Status"] ||
            t.TableBookingStatus;
          return raw === activeTab;
        });

  const groupedRows = groupTablesByRow(filteredTables);

  // Handler for table click
  const handleTableClick = async (
    table: BackendTableItem & { rowNo?: number }
  ) => {
    console.log("[Walkthrough Debug] Clicked table:", table);
    console.log(
      "[Walkthrough Debug] Current state - floor:",
      floor,
      "persons:",
      persons,
      "isInOrderFlow:",
      isInOrderFlow
    );

    const tableStatus = table["Table-Booking-Status_id"]?.Name || "";

    // If table has a status other than 'Available' and has an order id, show bill (regardless of entry point)
    const possibleOrderId =
      (table as any).order_id ||
      (table as any).orderId ||
      (table as any).currentOrder ||
      (table as any).current_order;
    if (tableStatus !== "Available" && possibleOrderId) {
      const order = await orderApi.getOrderById(possibleOrderId);
      if (order) {
        setOrderSummary({
          items: order.items,
          subtotal: order.pricingSummary?.subtotal || 0,
          tax: order.pricingSummary?.tax || 0,
          total: order.pricingSummary?.totalAmount || 0,
          orderId: order.orderId,
          paymentType: order.paymentDetails?.method,
          customerName: order.customerInfo?.name,
        });
        setOrderSummaryOpen(true);
      }
      return;
    }

    // If in order flow and clicking available table, start order and navigate
    if (
      isInOrderFlow &&
      (tableStatus === "Empty" ||
        tableStatus === undefined ||
        tableStatus === "Available")
    ) {
      console.log(
        "[Walkthrough Debug] In order flow, starting order for table:",
        table._id || table.Table_id
      );
      // Advance walkthrough before navigating
      const walkthrough = useWalkthroughStore.getState();
      const step = walkthrough.steps[walkthrough.currentStep];
      if (
        step?.selector === ".table-available" &&
        (!step.advanceOn ||
          step.advanceOn === "both" ||
          step.advanceOn === "ui")
      ) {
        walkthrough.next();
      }
      const orderPayload = {
        tableId: table.Table_id?.toString() || "",
        floor,
        persons,
      };
      console.log("Starting order with payload:", orderPayload);
      startOrder(orderPayload);
      navigate("/orders");
      return;
    }

    // If not in order flow (coming from sidebar) and clicking available table, do nothing
    if (
      !isInOrderFlow &&
      (tableStatus === "Available" || tableStatus === undefined)
    ) {
      console.log(
        "[Walkthrough Debug] Not in order flow, doing nothing for available table"
      );
      return;
    }
  };

  return (
    <div className="table-page-root min-h-screen bg-[#fafafa] px-6 lg:pt-10  pt-6 lg:px-10 ">
      {!editMode ? (
        <>
          <div className="flex flex-col lg:flex-row justify-between mb-6 lg:justify-between  lg:gap-4 gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4  ">
              <h1 className="text-2xl md:text-3xl font-bold whitespace-nowrap">
                {t("tables.title")}
              </h1>
            </div>
            {/* <div className="flex flex-col sm:flex-row gap-2 items-center min-w-0"> */}
            {/* <FloorDropdown floors={floors} selected={selectedFloor} onChange={setSelectedFloor} /> */}
            {/* </div> */}
            <div className="flex gap-2 items-center overflow-hidden ">
              <button
                className="px-3 py-1.5 flex gap-2 items-center rounded-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white font-medium shadow text-base sm:text-lg whitespace-nowrap min-w-fit sm:px-4 sm:py-2"
                onClick={() => setEditMode(true)}
              >
                <img src={editIcon} alt={t("tables.edit")} />
                <span className="pr-2">{t("tables.editTables")}</span>
              </button>

              <div className="overflow-x-scroll thin-scrollbar rounded-full bg-[#F1F1F1] p-2">
                <div className="flex gap-2">
                  {" "}
                  {statusTabs.map((tab) => (
                    <button
                      key={tab.value}
                      className={`px-4 py-1.5 rounded-full font-medium text-base transition-all ${
                        activeTab === tab.value
                          ? "bg-white text-black shadow font-bold"
                          : "bg-[#F5F5F5] text-[#222] font-medium"
                      }
                    ${tab.value === "all" ? "table-tab-all" : ""}
                    ${tab.value === "Served" ? "table-tab-served" : ""}
                    ${tab.value === "Waiting" ? "table-tab-waiting" : ""}
                    ${tab.value === "Reserved" ? "table-tab-reserved" : ""}`}
                      onClick={() => {
                        setActiveTab(tab.value);
                        const walkthrough = useWalkthroughStore.getState();
                        const step = walkthrough.steps[walkthrough.currentStep];
                        if (
                          !step?.advanceOn ||
                          step.advanceOn === "both" ||
                          step.advanceOn === "ui"
                        ) {
                          setTimeout(() => {
                            walkthrough.next();
                          }, 100);
                        }
                      }}
                      type="button"
                      style={{ minWidth: 110 }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Matrix layout: each row is horizontally scrollable */}
          <div className="flex flex-col gap-0 ">
            {isLoadingTables ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-600">
                    {t("tables.loading")}
                  </div>
                </div>
              </div>
            ) : groupedRows.length > 0 ? (
              groupedRows.map(({ row, tables }) => (
                <div
                  key={row}
                  className="flex  gap-4  overflow-x-scroll pb-2 min-w-0 snap-x snap-mandatory "
                >
                  {tables.map((table) => (
                    <TableCard
                      key={table._id || table.Table_id}
                      table={table}
                      onClick={() => handleTableClick(table)}
                    />
                  ))}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400 mb-2">
                    {t(`tables.empty.${activeTab}`, {
                      defaultValue: t("tables.empty.all"),
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t(`tables.emptySubtitle.${activeTab}`, {
                      defaultValue: t("tables.emptySubtitle.all"),
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Show OrderSummaryModal if orderSummaryOpen */}
          <OrderSummaryModal
            open={orderSummaryOpen}
            order={orderSummary || { items: [], subtotal: 0, tax: 0, total: 0 }}
            onClose={() => setOrderSummaryOpen(false)}
            onUpdateItemQuantity={async (itemId, newQty) => {
              if (orderSummary?.orderId) {
                // Find the item and update its quantity
                const updatedItems = orderSummary.items.map((item: OrderItem) =>
                  item.itemId === itemId ? { ...item, quantity: newQty } : item
                );

                // Recalculate pricing
                const subtotal = updatedItems.reduce(
                  (sum: number, item: OrderItem) => {
                    const addOnsTotal =
                      (item.addOns?.reduce(
                        (a: number, addon) => a + (addon.price || 0),
                        0
                      ) || 0) * (item.quantity || 1);
                    return (
                      sum + item.price * (item.quantity || 1) + addOnsTotal
                    );
                  },
                  0
                );
                const tax = Math.round(subtotal * 0.06);
                const total = subtotal + tax;

                // Update the order via API
                await orderApi.updateOrder(orderSummary.orderId, {
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

                // Update local state
                setOrderSummary({
                  ...orderSummary,
                  items: updatedItems,
                  subtotal,
                  tax,
                  total,
                });
              }
            }}
            onChoosePaymentOption={() => {
              setOrderSummaryOpen(false);
              setShowPaymentModal(true);
            }}
          />

          {/* Payment Modal */}
          <PaymentModal
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            total={orderSummary?.total || 0}
            onConfirm={async (method) => {
              if (orderSummary?.orderId) {
                // Update order with payment details
                await orderApi.updateOrder(orderSummary.orderId, {
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

          {/* Success Modal */}
          <SuccessModal
            open={showSuccessModal}
            title="Payment Received Successfully!"
            subtitle="Your payment has been processed and the order has been updated."
            buttonText="Back to Tables"
            onButtonClick={() => {
              setShowSuccessModal(false);
              // Refetch tables via RTK Query
              refetch?.();
            }}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              Table{" "}
              <span className="font-bold text-[#00000099]">(Floor Plan)</span>
            </h1>
          </div>
          <EditFloorPlan floor={floor} onSave={() => setEditMode(false)} />
        </>
      )}
    </div>
  );
};

export default TablePage;
