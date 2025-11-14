/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import { useOrderFlowStore } from "@/store/zustandStores";
import { useNavigate, useLocation } from "react-router-dom";
import ItemDetailsModal from "@/components/common/ItemDetailsModal";
import AddonsModal from "@/components/common/AddonsModal";
import personIcon from "@/assets/user_icon.svg";
import floorIcon from "@/assets/floor_icon.svg";
import tableIcon from "@/assets/table_filled_icon.svg";
import TrashIcon from "@/assets/Trash.svg";
import { SuccessModal } from "@/components/common/SuccessModal";
import successIcon from "@/assets/order/success_icon_large.svg";
import { createOrder, updateOrder, createPOSOrder } from "@/api/orderApi";
import type { OrderStatus } from "@/types/order";
import OrderSummaryModal from "@/components/common/OrderSummaryModal";
import PaymentModal from "@/components/common/PaymentModal";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { useWalkthroughUIStore } from "@/store/zustandStores";
import ReadyToScanModal from "@/components/common/ReadyToScanModal";
import ReadyToPayModal from "@/components/common/ReadyToPayModal";
import PaymentDoneModal from "@/components/common/PaymentDoneModal";
import { tableTrainingSteps } from "@/walkthrough/steps";
import {
  useGetAllItemsQuery,
  useGetAllItemTypesQuery,
  useGetItemTypeByIdQuery,
} from "@/redux/api/quickOrderSlice";
import FloorSelector from "@/components/common/FloorSelector";
import CustomerModal from "@/components/common/CustomerModal";
import { createCustomer } from "@/api/customerApi";
import type { CustomerFormData } from "@/types/customer";

// NOTE: floor list is now fetched from the API via FloorSelector component

const Orders: React.FC = () => {
  const {
    currentOrder,
    pendingItem,
    pendingCustomizedItem,
    setPendingCustomizedItem,
    clearPendingCustomizedItem,
    addItemToOrder,
    resetOrder,
    startOrder,
    updateOrderItem,
    setCurrentOrderId,
    removeOrderItem,
    setFloor,
    setPersons: setPersonsGlobal,
    setInOrderFlow,
  } = useOrderFlowStore();
  const [feedback, setFeedback] = useState("");
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [modalItem, setModalItem] = useState(null as any);
  const [modalSize, setModalSize] = useState("M");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showOrderSentPanel, setShowOrderSentPanel] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Table selection state
  const [persons, setPersons] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState("F-01");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showFloorPersonsPanel, setShowFloorPersonsPanel] = useState(false);
  const [orderSending, setOrderSending] = useState(false);
  const [showSummaryPanel, setShowSummaryPanel] = useState(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showReadyToScan, setShowReadyToScan] = useState(false);
  const [showReadyToPay, setShowReadyToPay] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);

  const selectedCategory = useWalkthroughUIStore((s) => s.selectedCategory);
  const setSelectedCategory = useWalkthroughUIStore(
    (s) => s.setSelectedCategory
  );

  const { steps, currentStep, isActive, next } = useWalkthroughStore();
  const [orderSummaryClickable, setOrderSummaryClickable] = useState(true);

  // Fetch item types and items using RTK Query
  const {
    data: itemTypesData,
    isLoading: itemTypesLoading,
    error: itemTypesError,
  } = useGetAllItemTypesQuery("");
  const {
    data: itemsData,
    isLoading: itemsLoading,
    error: itemsError,
  } = useGetAllItemsQuery("");
  const [selectedItemTypeId, setSelectedItemTypeId] = useState<string | null>(
    null
  );
  const {
    data: selectedItemType,
    isLoading: selectedItemTypeLoading,
    error: selectedItemTypeError,
  } = useGetItemTypeByIdQuery(selectedItemTypeId, {
    skip: !selectedItemTypeId,
  });

  // Map categories dynamically from itemTypesData
  const categories = useMemo(
    () => [
      { label: "All Items", value: "all", icon: null },
      ...(itemTypesData?.data?.map((type: any) => ({
        label: type.Name,
        value: type.Items_types_id.toString(),
        icon: type.emozi,
      })) || []),
    ],
    [itemTypesData]
  );

  // Map menu items for display (from getAllItemsQuery)
  const menuItems = useMemo(
    () =>
      itemsData?.data?.map((item: any) => ({
        itemId: item.Items_id.toString(),
        name: item["item-name"],
        price: item["item-price"],
        image: item.image,
        itemType: item.Items_types_id.Items_types_id.toString(),
        preparationStation:
          item.Items_types_id.Name === "Beverages" ? "Counter" : "Kitchen",
      })) || [],
    [itemsData]
  );

  // Map items from selectedItemType (getItemTypeByIdQuery)
  const categoryItems = useMemo(
    () =>
      selectedItemType?.data?.map((item: any) => ({
        itemId: item.Items_id.toString(),
        name: item["item-name"],
        price: item["item-price"],
        image: item.image,
        itemType: item.Items_types_id.Items_types_id.toString(),
        preparationStation:
          item.Items_types_id.Name === "Beverages" ? "Counter" : "Kitchen",
      })) || [],
    [selectedItemType]
  );

  // Memoized filtered items based on selected category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return menuItems;
    }
    return categoryItems;
  }, [selectedCategory, menuItems, categoryItems]);

  // Combined loading state
  const isLoading = itemTypesLoading || itemsLoading || selectedItemTypeLoading;
  // Combined error state
  const hasError = itemTypesError || itemsError || selectedItemTypeError;

  console.log("[Orders render]", {
    selectedTable,
    currentOrder,
    pendingCustomizedItem,
    showOrderSentPanel,
    showConfirmationModal,
    showFloorPersonsPanel,
    selectedCategory,
    selectedItemTypeId,
    menuItems,
    filteredItems,
    selectedItemType,
    isLoading,
    hasError,
  });

  // Force enable order summary button during walkthrough
  useEffect(() => {
    if (isActive && steps[currentStep]?.selector === ".select-payment-btn") {
      setOrderSummaryClickable(true);
    }
  }, [isActive, steps, currentStep]);

  // Set in-order flow
  useEffect(() => {
    setInOrderFlow(true);
  }, [setInOrderFlow]);

  // Handle pending item
  useEffect(() => {
    if (pendingItem && currentOrder) {
      setModalItem(pendingItem);
      setShowItemDetailsModal(true);
    }
  }, [pendingItem, currentOrder]);

  // Handle pending customized item
  useEffect(() => {
    if (pendingCustomizedItem && selectedTable && currentOrder) {
      addItemToOrder(pendingCustomizedItem);
      clearPendingCustomizedItem();
    }
  }, [pendingCustomizedItem, selectedTable, currentOrder]);

  // Auto-start order for item-first flow
  useEffect(() => {
    if (pendingCustomizedItem && selectedTable && !currentOrder) {
      console.log("[Effect] Auto-start order (item-first flow)", {
        pendingCustomizedItem,
        selectedTable,
        currentOrder,
      });
      startOrder({
        tableId: selectedTable,
        floor: Number(selectedFloor),
        persons,
      });
    }
  }, [
    pendingCustomizedItem,
    selectedTable,
    currentOrder,
    selectedFloor,
    persons,
  ]);

  // Sync local state with currentOrder
  useEffect(() => {
    if (currentOrder && currentOrder.tableId) {
      setSelectedTable(currentOrder.tableId);
      setSelectedFloor(currentOrder.floor.toString());
      setPersons(currentOrder.persons);
    }
  }, [currentOrder]);

  // Handle location state for order sent panel
  useEffect(() => {
    if (location.state && location.state.showOrderSentPanel) {
      setShowOrderSentPanel(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Dummy size check
  const itemHasSize = () => true;

  // Handle right panel click (table-first flow)
  const handleRightPanelClick = () => {
    setShowFloorPersonsPanel(true);
    const walkthrough = useWalkthroughStore.getState();
    const step = walkthrough.steps[walkthrough.currentStep];
    if (
      step?.selector === ".select-table-prompt" &&
      (!step.advanceOn || step.advanceOn === "both" || step.advanceOn === "ui")
    ) {
      walkthrough.next();
    }
  };

  // Handle item click (item-first flow)
  const handleAddToCart = (item: any) => {
    if (!currentOrder && !selectedTable && !showFloorPersonsPanel) {
      setTimeout(() => {
        setModalItem(item);
        if (itemHasSize()) {
          setShowItemDetailsModal(true);
        } else {
          setShowAddonsModal(true);
        }
        setShowFloorPersonsPanel(true);
      }, 100);
      return;
    }
    setModalItem(item);
    if (itemHasSize()) {
      setShowItemDetailsModal(true);
    } else {
      setShowAddonsModal(true);
    }
  };

  // Handle AddonsModal save
  const handleAddonsSave = ({
    addons,
    note,
  }: {
    addons: string[];
    note: string;
  }) => {
    if (!modalItem) return;
    const dummyAddons = [
      { label: "No Ice", price: 0 },
      { label: "Less Sugar", price: 0 },
      { label: "No Sugar", price: 0 },
      { label: "Extra Cream", price: 20 },
      { label: "Extra Toppings", price: 20 },
      { label: "Extra Thick", price: 20 },
    ];
    const customizedItem = {
      ...modalItem,
      size: modalSize,
      addOns: addons.map((label, idx) => {
        const found = dummyAddons.find((a) => a.label === label);
        return {
          id: String(idx),
          name: label,
          price: found ? found.price : 0,
        };
      }),
      notes: note,
    };
    if (!currentOrder && !selectedTable) {
      setPendingCustomizedItem(customizedItem);
      setShowAddonsModal(false);
      setModalItem(null);
      setModalSize("M");
      return;
    }
    addItemToOrder(customizedItem);
    setFeedback(`${modalItem.name} added to order!`);
    setTimeout(() => setFeedback(""), 1200);
    setShowAddonsModal(false);
    setModalItem(null);
    setModalSize("M");
  };

  // Order summary helpers
  const orderItems = currentOrder?.items || [];
  const subtotal = orderItems.reduce((sum: number, item: any) => {
    const addOnsTotal =
      (item.addOns?.reduce(
        (a: number, addon: any) => a + (addon.price || 0),
        0
      ) || 0) * (item.quantity || 1);
    return sum + item.price * (item.quantity || 1) + addOnsTotal;
  }, 0);
  const tax = Math.round(subtotal * 0.06);
  const total = subtotal + tax;
  const hasKitchenItem = orderItems.some(
    (item: any) => item.preparationStation === "Kitchen"
  );
  const allCounter =
    orderItems.length > 0 &&
    orderItems.every((item: any) => item.preparationStation === "Counter");

  // Handle order action
  const handleOrderAction = async () => {
    // Check if customer exists, if not show customer modal
    if (!currentOrder?.customerId) {
      console.log("[Order Action] No customer ID, showing customer modal");
      setShowCustomerModal(true);
      return;
    }

    // Proceed with normal flow
    if (hasKitchenItem) {
      setShowConfirmationModal(true);
    } else if (allCounter) {
      setTimeout(() => setShowOrderSentPanel(true), 800);
    }
  };

  // Confirm order and call API
  const handleConfirmationContinue = async () => {
    if (!currentOrder) return;

    // Check if customer ID exists
    if (!currentOrder.customerId) {
      alert("Customer information is required. Please add customer details.");
      return;
    }

    setOrderSending(true);
    try {
      // Transform items to POS order format
      const posOrderItems = currentOrder.items.map((item: any) => ({
        item_id: parseInt(item.itemId),
        item_Quentry: item.quantity || 1,
        item_Addons_id:
          item.addOns && item.addOns.length > 0
            ? parseInt(item.addOns[0].id)
            : undefined,
        item_Variants_id: item.size ? 1 : undefined, // You may need to map size to variant ID
      }));

      // Create POS order request
      const posOrderPayload = {
        items: posOrderItems,
        Tax: tax,
        Customer_id: currentOrder.customerId,
        Dining_Option: "Dine in",
        Table_id: parseInt(currentOrder.tableId.replace("t-", "")),
        Kitchen_id: 0,
        Status: true,
      };

      console.log("Sending POS order:", posOrderPayload);
      const result = await createPOSOrder(posOrderPayload);

      if (result.success && result.data.Order_id) {
        console.log("POS order created successfully:", result.data);
        setCurrentOrderId(result.data.Order_id.toString());
      }

      setShowConfirmationModal(false);
      setShowOrderSentPanel(true);
    } catch (error) {
      console.error("Failed to send order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setOrderSending(false);
    }
  };

  // Handle next order
  const handleNextOrder = () => {
    resetOrder();
    setShowOrderSentPanel(false);
    setSelectedTable(null);
    setPersons(1);
    setSelectedFloor("F-01");
    setSelectedCategory("all");
    setSelectedItemTypeId(null);
    const walkthrough = useWalkthroughStore.getState();
    walkthrough.complete();
  };

  // Table selection UI logic
  const handleSelectTable = () => {
    navigate("/table", { state: { persons, floor: selectedFloor } });
    const walkthrough = useWalkthroughStore.getState();
    const step = walkthrough.steps[walkthrough.currentStep];
    if (
      step?.selector === ".select-table" &&
      (!step.advanceOn || step.advanceOn === "both" || step.advanceOn === "ui")
    ) {
      walkthrough.next();
    }
  };

  // Reset showFloorPersonsPanel after table selection
  useEffect(() => {
    if (selectedTable && showFloorPersonsPanel) {
      setShowFloorPersonsPanel(false);
    }
  }, [selectedTable, showFloorPersonsPanel]);

  const handleDeleteItem = (itemId: string) => {
    if (!currentOrder) return;
    removeOrderItem(itemId);
  };

  // Toggle allergy for an item
  const handleToggleAllergy = (itemId: string) => {
    if (!currentOrder) return;
    const item = currentOrder.items.find((i: any) => i.itemId === itemId);
    if (!item) return;
    updateOrderItem(itemId, { allergy: !item.allergy });
  };

  // Expose for walkthrough controller
  (window as any).handleSelectTable = handleSelectTable;
  (window as any).handleRightPanelClick = handleRightPanelClick;

  // Walkthrough step check
  useEffect(() => {
    const walkthrough = useWalkthroughStore.getState();
    const step = walkthrough.steps[walkthrough.currentStep];
    if (
      walkthrough.isActive &&
      step?.selector === ".order-item-first" &&
      filteredItems.length > 0 &&
      document.querySelector(".order-item-first")
    ) {
      // No-op: controller will show the step
    }
  }, [filteredItems]);

  // Order summary clickability
  useEffect(() => {
    const step = steps[currentStep];
    if (isActive && step && step.selector === ".order-summary-panel") {
      setOrderSummaryClickable(false);
    } else {
      setOrderSummaryClickable(true);
    }
  }, [steps, currentStep, isActive]);

  // Payment flow timeouts
  useEffect(() => {
    if (showReadyToScan) {
      const t = setTimeout(() => {
        setShowReadyToScan(false);
        setShowReadyToPay(true);
        next();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [showReadyToScan, next]);

  useEffect(() => {
    if (showReadyToPay) {
      const t = setTimeout(() => {
        setShowReadyToPay(false);
        next();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [showReadyToPay, next]);

  // Payment done modal close
  const handlePaymentDoneClose = () => {
    setShowPaymentOptions(false);
    setShowOrderSentPanel(true);
    next();
    navigate("/orders");
  };

  // Handle customer creation
  const handleCustomerSubmit = async (customerData: CustomerFormData) => {
    if (!currentOrder) {
      console.error("No order in progress");
      return;
    }

    if (!selectedTable) {
      console.error("No table selected");
      return;
    }

    setCustomerLoading(true);
    try {
      const response = await createCustomer({
        phone: customerData.phone,
        Name: customerData.name,
        DOB: customerData.dob,
        Customer_type_id: customerData.customerTypeId,
        Table_id: parseInt(selectedTable.replace("t-", "")),
      });

      if (response.success && response.data.Customer_id) {
        console.log("[Customer] Created successfully", {
          customerId: response.data.Customer_id,
        });

        // Update the current order with customer ID
        startOrder({
          tableId: currentOrder.tableId,
          floor: currentOrder.floor,
          persons: currentOrder.persons,
          customerId: response.data.Customer_id,
        });

        setShowCustomerModal(false);

        // Now proceed with the order action
        setTimeout(() => {
          if (hasKitchenItem) {
            setShowConfirmationModal(true);
          } else if (allCounter) {
            setShowOrderSentPanel(true);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer. Please try again.");
    } finally {
      setCustomerLoading(false);
    }
  };

  // Walkthrough completion
  const { completed, activeTraining, startTraining, reset } =
    useWalkthroughStore();
  useEffect(() => {
    if (completed && activeTraining === "order") {
      reset();
      setTimeout(() => {
        startTraining("table", tableTrainingSteps);
        navigate("/");
      }, 50);
    }
  }, [completed, activeTraining, startTraining, reset, navigate]);

  return (
    <div className="flex flex-col mb-20 py-4 sm:p-8 bg-[#fafafa] max-w-screen">
      <h1 className="text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-4">
        Quick Orders
      </h1>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 h-auto lg:h-[70vh] items-stretch">
        {/* Left: Menu Items Grid */}
        <div className="flex-1 bg-white rounded-3xl shadow-lg p-3 sm:p-6 overflow-y-auto relative">
          {/* Category Filter Bar */}
          <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto flex-nowrap whitespace-nowrap thin-scrollbar bg-[#F1F1F1] rounded-full p-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? "bg-white shadow text-black"
                    : "bg-transparent text-gray-500 hover:bg-gray-100"
                } ${cat.value === "all" ? "all-items-tab" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.value);
                  setSelectedItemTypeId(cat.value !== "all" ? cat.value : null);
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
              >
                {cat.icon && <span className="text-xl">{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>
          {/* Items Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-[#6A1B9A] rounded-full animate-spin"></div>
            </div>
          ) : hasError || filteredItems.length === 0 ? (
            <div className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 text-center text-gray-400">
              No items found.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4">
              {filteredItems.map((item: any, idx: number) => (
                <div
                  key={item.itemId + idx}
                  className={`w-[125px] min-h-[140px] bg-white rounded-xl shadow-[0_0_10px_2px_rgba(0,0,0,0.1)] flex flex-col items-center justify-between p-2 cursor-pointer border border-gray-100 group min-w-[125px] mx-auto${
                    idx === 0 ? " order-item-first" : ""
                  }${idx === 1 ? " order-item-second" : ""}${
                    idx === 2 ? " order-item-third" : ""
                  }`}
                  onClick={() => {
                    const walkthrough = useWalkthroughStore.getState();
                    const step = walkthrough.steps[walkthrough.currentStep];
                    if (
                      walkthrough.isActive &&
                      (step?.selector === ".order-item-first" ||
                        step?.selector === ".order-item-second" ||
                        step?.selector === ".order-item-third")
                    ) {
                      addItemToOrder({ ...item, quantity: 1 });
                      walkthrough.next();
                      return;
                    }
                    handleAddToCart(item);
                  }}
                >
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/81x67?text=Item"
                    }
                    alt={item.name}
                    className="w-[81px] h-[67px] object-contain mt-2"
                  />
                  <div className="text-[14px] font-medium text-center mt-2 line-clamp-2">
                    {item.name}
                  </div>
                  <div className="text-[12px] font-semibold text-black mt-1">
                    {item.price} XOF
                  </div>
                </div>
              ))}
            </div>
          )}
          {feedback && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full shadow-lg z-50 transition-all animate-bounce">
              {feedback}
            </div>
          )}
          {showOrderSentPanel && (
            <div
              className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(0,0,0,0)] bg-opacity-30"
              style={{ pointerEvents: "auto" }}
            ></div>
          )}
        </div>
        {/* Right: Table/Order Panel */}
        <div
          className="w-full lg:w-96 bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center text-center min-h-[300px] sm:min-h-[400px] overflow-y-auto mt-4 lg:mt-0"
          onClick={handleRightPanelClick}
          style={{
            cursor:
              !currentOrder &&
              !selectedTable &&
              !showFloorPersonsPanel &&
              !showOrderSentPanel &&
              !showConfirmationModal
                ? "pointer"
                : "default",
          }}
        >
          {/* Order Sent Panel */}
          {showOrderSentPanel && (
            <div className="w-full h-full flex flex-col justify-between overflow-scroll order-sent-panel">
              <div className="bg-[#EDEDED] rounded-t-2xl p-4 w-full text-left">
                <div className="text-lg font-bold">
                  #
                  {currentOrder
                    ? (currentOrder as any).orderId ||
                      (Math.random() * 1000).toFixed(0)
                    : (Math.random() * 1000).toFixed(0)}
                </div>
                <div className="flex justify-between">
                  <div className="text-xs font-semibold">Order Created</div>
                  <div className="text-xs font-semibold text-right">
                    Table - {currentOrder?.tableId.replace("t-", "")}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="rounded-full p-6 mb-4">
                  <img src={successIcon} alt="success" />
                </div>
              </div>
              <button
                className="w-full py-3 rounded-b-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all"
                onClick={handleNextOrder}
              >
                Next Order
              </button>
            </div>
          )}
          {/* Confirmation Modal */}
          <SuccessModal
            open={showConfirmationModal}
            title="Order Sent to Kitchen"
            subtitle="Your Dish has been created and will be updated in the menu in couple of minutes"
            buttonText={orderSending ? "Sending..." : "Continue"}
            onButtonClick={handleConfirmationContinue}
          />
          {/* Floor/persons selection UI */}
          {!selectedTable &&
            !currentOrder &&
            showFloorPersonsPanel &&
            !showOrderSentPanel &&
            !showConfirmationModal && (
              <div className="w-full h-full flex flex-col justify-between overflow-scroll person-floor-panel">
                <div
                  className="rounded-t-2xl p-4 text-black text-left"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(106, 27, 154, 0.5) 0%, rgba(211, 47, 47, 0.5) 100%)",
                  }}
                >
                  <div className="text-lg font-bold">Floor Map</div>
                  <div className="text-xs font-normal">
                    Select Floor and Persons
                  </div>
                </div>
                <div className="">
                  <div className="p-6">
                    <div className="font-semibold mb-6 text-start">
                      Select Persons:
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="w-10 h-10 rounded-l-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white text-2xl flex items-center justify-center"
                        onClick={() => {
                          setPersons((p) => {
                            const newVal = Math.max(1, p - 1);
                            setPersonsGlobal(newVal);
                            return newVal;
                          });
                        }}
                      >
                        –
                      </button>
                      <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-200 text-lg font-bold">
                        {persons}
                      </div>
                      <button
                        className="w-10 h-10 rounded-r-lg bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white text-2xl flex items-center justify-center"
                        onClick={() => {
                          setPersons((p) => {
                            const newVal = Math.min(20, p + 1);
                            setPersonsGlobal(newVal);
                            return newVal;
                          });
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="mb-6 p-6">
                    <div className="font-semibold mb-6 text-start">
                      Select Floor:
                    </div>
                    <div>
                      <FloorSelector
                        selectedFloor={selectedFloor}
                        onSelect={(floorId) => {
                          setSelectedFloor(floorId);
                          setFloor(Number(floorId));
                        }}
                      />
                    </div>
                  </div>
                  <button
                    className="select-table-panel w-full py-3 mt-2 rounded-b-lg text-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all"
                    onClick={() => {
                      const walkthrough = useWalkthroughStore.getState();
                      const step = walkthrough.steps[walkthrough.currentStep];
                      if (
                        step?.selector === ".person-floor-panel" &&
                        (!step.advanceOn ||
                          step.advanceOn === "both" ||
                          step.advanceOn === "ui")
                      ) {
                        walkthrough.next();
                      }
                      handleSelectTable();
                    }}
                  >
                    Select Table
                  </button>
                </div>
              </div>
            )}
          {/* Initial State: Prompt to select table */}
          {!selectedTable &&
            !currentOrder &&
            !showOrderSentPanel &&
            !showConfirmationModal &&
            !showFloorPersonsPanel && (
              <div
                className="flex flex-col items-center justify-center h-full w-full select-table-prompt"
                onClick={handleRightPanelClick}
              >
                <div className="text-2xl font-bold text-[#00000099] mb-2">
                  Tap to Select Table
                </div>
                <div className="text-2xl font-bold text-[#00000099] mb-2">
                  &amp;
                  <br />
                  Start Order
                </div>
              </div>
            )}
          {/* Table selected, but order not started */}
          {selectedTable &&
            !currentOrder &&
            !pendingCustomizedItem &&
            !showOrderSentPanel &&
            !showConfirmationModal && (
              <div className="w-full h-full flex flex-col justify-between overflow-scroll">
                <div
                  className="rounded-t-2xl p-4 text-black text-left"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(106, 27, 154, 0.5) 0%, rgba(211, 47, 47, 0.5) 100%)",
                  }}
                >
                  <div className="text-2xl font-bold">Start Order</div>
                  <div className="text-xs font-normal">
                    Floor, Table, Person Display
                  </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 py-8 px-4">
                  <div className="flex w-1/2 gap-2 text-lg">
                    <img src={personIcon} alt="person icon" />
                    Persons:{" "}
                    <span className="font-bold">
                      {persons.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex w-1/2 gap-2 text-lg">
                    <img src={floorIcon} alt="floor icon" />
                    Floor: <span className="font-bold">{selectedFloor}</span>
                  </div>
                  <div className="flex w-1/2 gap-2 text-lg">
                    <img src={tableIcon} alt="table icon" />
                    Table:{" "}
                    <span className="font-bold">
                      {(selectedTable ?? "").replace("t-", "")}
                    </span>
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-b-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all"
                  onClick={() => {
                    console.log("[Button] Start Order clicked", {
                      selectedTable,
                      selectedFloor,
                      persons,
                    });
                    startOrder({
                      tableId: selectedTable,
                      floor: Number(selectedFloor),
                      persons,
                    });
                  }}
                >
                  Start Order
                </button>
              </div>
            )}
          {/* Order Summary Panel */}
          {currentOrder &&
            ((currentOrder.items && currentOrder.items.length > 0) ||
              showSummaryPanel) &&
            !showOrderSentPanel &&
            !showConfirmationModal && (
              <div
                className="order-summary-panel w-full h-full flex flex-col justify-between overflow-scroll"
                style={{
                  pointerEvents: orderSummaryClickable ? "auto" : "none",
                  opacity: orderSummaryClickable ? 1 : 0.6,
                }}
              >
                <div
                  className="rounded-t-2xl py-4 px-7 text-black text-left"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(106, 27, 154, 0.5) 0%, rgba(211, 47, 47, 0.5) 100%)",
                  }}
                >
                  <div className="text-2xl font-bold">Order Summary</div>
                  <div className="text-base font-medium">
                    Table - {currentOrder.tableId.replace("t-", "")}
                  </div>
                </div>
                <div className="flex flex-col gap-2 py-4 px-4 flex-1 overflow-y-auto">
                  <div className="flex font-medium text-base border-b border-black pb-2">
                    <div className="w-12">Qty</div>
                    <div className="flex-1">Item</div>
                    <div className="w-20">Size</div>
                    <div className="w-20 text-right">Total</div>
                  </div>
                  {orderItems.map((item: any, idx: number) => (
                    <div
                      key={item.itemId + idx}
                      className="flex justify-between text-base border-b border-gray-100 group"
                    >
                      <div className="w-12">
                        {item.quantity || 1} x{item.size || "L"}
                      </div>
                      <div className="flex-1 flex flex-col items-start">
                        <span className="font-semibold text-sm">
                          {item.name}
                        </span>
                        {item.addOns && item.addOns.length > 0 && (
                          <>
                            <div className="text-[10px] text-[#00000099] text-wrap text-start">
                              {item.addOns.map((a: any) => a.name).join(", ")}
                            </div>
                            {(() => {
                              const addOnTotal =
                                item.addOns.reduce(
                                  (sum: number, a: any) => sum + (a.price || 0),
                                  0
                                ) * (item.quantity || 1);
                              return addOnTotal > 0 ? (
                                <div className="text-[10px] text-[#D32F2F] font-semibold mt-0.5">
                                  +{addOnTotal} XOF
                                </div>
                              ) : null;
                            })()}
                          </>
                        )}
                        {item.notes && (
                          <div className="text-[10px] text-[#00000099] text-wrap text-start">
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="w-20 text-right font-bold">
                        <button
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all mb-1 ${
                            item.allergy
                              ? "bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white shadow"
                              : "bg-[#F6E6F8] text-[#303030] border border-[#E0E0E0]"
                          }`}
                          onClick={() => handleToggleAllergy(item.itemId)}
                        >
                          Allergy
                        </button>
                      </div>
                      <div
                        className="flex flex-col justify-between items-end h-full ml-auto"
                        style={{ minHeight: 60 }}
                      >
                        <div className="w-20 text-right text-[10px] font-semibold mb-auto">
                          {item.price} XOF
                        </div>
                        <button
                          className="w-8 h-8 flex items-baseline justify-end mt-auto opacity-80 hover:opacity-100"
                          onClick={() => handleDeleteItem(item.itemId)}
                          aria-label="Delete item"
                        >
                          <img
                            src={TrashIcon}
                            alt="Delete"
                            className="w-5 h-5"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-gray-300"></div>
                <div
                  className="p-4"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(106, 27, 154, 0.1) 0%, rgba(211, 47, 47, 0.1) 100%)",
                  }}
                >
                  <div className="flex text-xs justify-between text-[#5A5A5A] mb-1">
                    <span>Tax 6%</span>
                    <span>{tax.toLocaleString()} XOF</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl text-[#303030]">
                    <span>
                      Subtotal{" "}
                      <span className="font-normal text-sm">(Incl. tax)</span>
                    </span>
                    <span className="text-[#303030] font-medium">
                      {total.toLocaleString()} XOF
                    </span>
                  </div>
                </div>
                {orderItems.length > 0 &&
                  orderItems.some(
                    (item: any) => item.itemType !== "Beverage"
                  ) && (
                    <button
                      className="w-full py-2 text-lg font-semibold bg-green-500 text-white shadow hover:opacity-90 transition-all"
                      onClick={handleOrderAction}
                    >
                      Send to Kitchen
                    </button>
                  )}
                {orderItems.length > 0 && (
                  <button
                    className="select-payment-btn w-full py-3 text-lg font-bold bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white rounded-b-2xl rounded-t-none shadow hover:opacity-90 transition-all"
                    onClick={() => {
                      setShowOrderSummaryModal(true);
                      const walkthrough = useWalkthroughStore.getState();
                      const step = walkthrough.steps[walkthrough.currentStep];
                      if (
                        step?.selector === ".select-payment-btn" &&
                        (!step.advanceOn ||
                          step.advanceOn === "both" ||
                          step.advanceOn === "ui")
                      ) {
                        walkthrough.next();
                      }
                    }}
                    disabled={!orderSummaryClickable}
                    style={{
                      pointerEvents: orderSummaryClickable ? "auto" : "none",
                      opacity: orderSummaryClickable ? 1 : 0.6,
                    }}
                  >
                    Select Payment Option
                  </button>
                )}
              </div>
            )}
          {/* Start Order Panel */}
          {currentOrder &&
            currentOrder.items &&
            currentOrder.items.length === 0 &&
            !showOrderSentPanel &&
            !showConfirmationModal &&
            !showSummaryPanel && (
              <div className="w-full h-full flex flex-col justify-between overflow-scroll">
                <div
                  className="rounded-t-2xl p-4 text-black text-left"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(106, 27, 154, 0.5) 0%, rgba(211, 47, 47, 0.5) 100%)",
                  }}
                >
                  <div className="text-2xl font-bold">Start Order</div>
                  <div className="text-xs font-normal">
                    Floor, Table, Person Display
                  </div>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 py-8 px-4">
                  <div className="flex w-1/2 gap-2 text-lg">
                    <img src={personIcon} alt="person icon" />
                    Persons:{" "}
                    <span className="font-bold">
                      {persons.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex w-1/2 gap-2 text-lg">
                    <img src={floorIcon} alt="floor icon" />
                    Floor: <span className="font-bold">{selectedFloor}</span>
                  </div>
                  <div className="flex w-1/2 gap-2 text-lg">
                    <img src={tableIcon} alt="table icon" />
                    Table:{" "}
                    <span className="font-bold">
                      {(selectedTable ?? "").replace("t-", "")}
                    </span>
                  </div>
                </div>
                <button
                  className="w-full py-3 rounded-b-2xl text-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all"
                  onClick={() => {
                    setShowSummaryPanel(true);
                  }}
                >
                  Start Order
                </button>
              </div>
            )}
        </div>
      </div>
      {/* Modals */}
      <CustomerModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleCustomerSubmit}
        isLoading={customerLoading}
      />
      <ItemDetailsModal
        open={showItemDetailsModal}
        item={modalItem}
        onClose={() => setShowItemDetailsModal(false)}
        onSelect={(size) => {
          setModalSize(size);
          setShowItemDetailsModal(false);
          setTimeout(() => setShowAddonsModal(true), 100);
        }}
      />
      <AddonsModal
        open={showAddonsModal}
        item={modalItem}
        selectedSize={modalSize}
        tableId={currentOrder?.tableId}
        onClose={() => setShowAddonsModal(false)}
        onSave={handleAddonsSave}
      />
      <OrderSummaryModal
        open={showOrderSummaryModal}
        onClose={() => setShowOrderSummaryModal(false)}
        order={{
          items: orderItems,
          subtotal,
          tax,
          total,
          orderId: (currentOrder as any)?.orderId,
          paymentType: "",
          customerName: "",
        }}
        onUpdateItemQuantity={(itemId, newQty) => {
          updateOrderItem(itemId, { quantity: newQty });
        }}
        onChoosePaymentOption={() => {
          setShowOrderSummaryModal(false);
          setTimeout(() => setShowPaymentOptions(true), 200);
        }}
      />
      <CustomerModal
        open={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleCustomerSubmit}
        isLoading={customerLoading}
      />
      <PaymentModal
        open={showPaymentOptions}
        onClose={() => setShowPaymentOptions(false)}
        total={total}
        onConfirm={async (method) => {
          if (isActive) return;
          const orderId =
            (currentOrder && (currentOrder as any).orderId) ||
            `${currentOrder?.tableId}-${currentOrder?.floor}-${currentOrder?.persons}`;
          if (currentOrder && orderId) {
            await updateOrder(orderId, {
              paymentDetails: {
                method,
                status: "Paid",
              },
            });
            const subtotal = currentOrder.items.reduce(
              (sum: number, item: any) => {
                const addOnsTotal =
                  (item.addOns?.reduce(
                    (a: number, addon: any) => a + (addon.price || 0),
                    0
                  ) || 0) * (item.quantity || 1);
                return sum + item.price * (item.quantity || 1) + addOnsTotal;
              },
              0
            );
            const tax = Math.round(subtotal * 0.06);
            const total = subtotal + tax;
            const now = new Date().toISOString();
            await createOrder({
              orderId,
              status: "Pending",
              orderType: "Dine-In",
              tableInfo: {
                tableId: currentOrder.tableId,
                floor: currentOrder.floor.toString(),
                status: "Occupied",
              },
              waiterName: "John Doe",
              pricingSummary: {
                subtotal,
                tax,
                discount: 0,
                serviceCharge: 0,
                totalAmount: total,
              },
              paymentDetails: {
                method,
                status: "Paid",
              },
              items: currentOrder.items,
              createdAt: now,
              updatedAt: now,
              statusHistory: [{ status: "Pending" as OrderStatus, at: now }],
            });
            setShowPaymentOptions(false);
            setShowSuccessModal(true);
          }
        }}
      />
      {isActive && steps[currentStep]?.selector === ".ready-to-scan-modal" && (
        <ReadyToScanModal onClose={() => setTimeout(next, 2000)} />
      )}
      {isActive && steps[currentStep]?.selector === ".ready-to-pay-modal" && (
        <ReadyToPayModal onClose={() => setTimeout(next, 2000)} />
      )}
      {isActive && steps[currentStep]?.selector === ".payment-done-modal" && (
        <PaymentDoneModal onClose={handlePaymentDoneClose} />
      )}
      <SuccessModal
        open={showSuccessModal}
        title="Payment Received Successful !"
        subtitle="Your payment has been processed and the order has been updated."
        buttonText="Start new Order"
        onButtonClick={() => {
          setShowSuccessModal(false);
          resetOrder();
          const newOrderId = Date.now().toString();
          startOrder({
            tableId: "",
            floor: 0,
            persons: 1,
            orderId: newOrderId,
          });
          navigate("/orders", { state: { showOrderSentPanel: true } });
        }}
      />
    </div>
  );
};

export default Orders;
