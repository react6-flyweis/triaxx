import React, { useState } from "react";
import { useTranslation } from "react-i18next";
// import cashIcon from '@/assets/payment/cash.svg';
import giftCardIcon from "@/assets/payment/gift_card.svg";
import gpayIcon from "@/assets/payment/gpay.svg";
import applepayIcon from "@/assets/payment/applepay.svg";
// import momoIcon from '@/assets/payment/momo.svg';
// import orangeIcon from '@/assets/payment/orange.svg';
import cardIcon from "@/assets/payment/card.svg";
import splitIcon from "@/assets/payment/split.svg";
import type { PaymentMethod } from "@/types/order";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentMethod) => void;
  total: number;
}

const paymentOptions = [
  { labelKey: "cash", value: "Cash", icon: "" },
  { labelKey: "giftcard", value: "GiftCard", icon: giftCardIcon },
];
const onlineOptions = [
  { labelKey: "gpay", value: "GPay", icon: gpayIcon },
  { labelKey: "applepay", value: "ApplePay", icon: applepayIcon },
  { labelKey: "momo", value: "MoMo", icon: "" },
  { labelKey: "orange", value: "OrangeMoney", icon: "" },
];
const cardOptions = [
  { labelKey: "debitcard", value: "DebitCard", icon: cardIcon },
];
const splitOptions = [{ labelKey: "split", value: "Split", icon: splitIcon }];

const valueToPaymentMethod = (value: string): PaymentMethod => {
  switch (value) {
    case "Cash":
      return "Cash";
    case "DebitCard":
      return "Credit Card";
    case "GPay":
    case "ApplePay":
    case "MoMo":
    case "OrangeMoney":
      return "Online";
    case "GiftCard":
    case "Split":
      return "Other";
    default:
      return "Other";
  }
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  onConfirm,
  total,
}) => {
  const [selected, setSelected] = useState<string>("Cash");
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out opacity-100 pointer-events-auto">
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.15)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl w-[420px] max-w-full shadow-xl overflow-hidden relative z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="text-2xl font-bold text-left">
            {t("orders.payment.title")}
          </div>
          <button
            className="text-2xl font-bold text-gray-500"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="flex flex-col gap-2 px-6 pt-2 pb-4 flex-1">
          {paymentOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-between py-2 cursor-pointer border-b border-gray-200"
            >
              <div className="flex items-center gap-3">
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt={t(`orders.payment.options.${opt.labelKey}`)}
                    className="w-6 h-6"
                  />
                )}
                <span className="font-medium text-base">
                  {t(`orders.payment.options.${opt.labelKey}`)}
                </span>
              </div>
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="accent-black w-5 h-5"
              />
            </label>
          ))}
          <div className="text-xs text-[#8E8E93] mt-2 mb-1">
            {t("orders.payment.groups.online")}
          </div>
          {onlineOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-between py-2 cursor-pointer border-b border-gray-200"
            >
              <div className="flex items-center gap-3">
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt={t(`orders.payment.options.${opt.labelKey}`)}
                    className="w-6 h-6"
                  />
                )}
                <span className="font-medium text-base">
                  {t(`orders.payment.options.${opt.labelKey}`)}
                </span>
              </div>
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="accent-black w-5 h-5"
              />
            </label>
          ))}
          <div className="text-xs text-[#8E8E93] mt-2 mb-1">
            {t("orders.payment.groups.card")}
          </div>
          {cardOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-between py-2 cursor-pointer border-b border-gray-200"
            >
              <div className="flex items-center gap-3">
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt={t(`orders.payment.options.${opt.labelKey}`)}
                    className="w-6 h-6"
                  />
                )}
                <span className="font-medium text-base">
                  {t(`orders.payment.options.${opt.labelKey}`)}
                </span>
              </div>
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="accent-black w-5 h-5"
              />
            </label>
          ))}
          <div className="text-xs text-[#8E8E93] mt-2 mb-1">
            {t("orders.payment.groups.split")}
          </div>
          {splitOptions.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-between py-2 cursor-pointer border-b border-gray-200"
            >
              <div className="flex items-center gap-3">
                {opt.icon && (
                  <img
                    src={opt.icon}
                    alt={t(`orders.payment.options.${opt.labelKey}`)}
                    className="w-6 h-6"
                  />
                )}
                <span className="font-medium text-base">
                  {t(`orders.payment.options.${opt.labelKey}`)}
                </span>
              </div>
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="accent-black w-5 h-5"
              />
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
          <button
            className="w-full py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all"
            onClick={() => onConfirm(valueToPaymentMethod(selected))}
          >
            {t("orders.payment.pay", {
              amount: `${total.toLocaleString()} XOF`,
            })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
