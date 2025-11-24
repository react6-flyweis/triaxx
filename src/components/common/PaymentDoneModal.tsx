import React from "react";
import { useTranslation } from "react-i18next";
import paymentDoneIcon from "@/assets/payment/payment_done.svg";

interface PaymentDoneModalProps {
  onClose: () => void;
}

const PaymentDoneModal: React.FC<PaymentDoneModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center w-[320px] payment-done-modal">
        <div className="text-2xl font-bold mb-2">
          {t("orders.ready.done.title")}
        </div>
        <div className="text-center text-base mb-6 text-black/80">
          {t("orders.ready.done.description")}
        </div>
        <img
          src={paymentDoneIcon}
          alt="Payment Done"
          className="w-20 h-20 mb-8"
        />
        <button
          className="w-full py-3 rounded-xl text-lg font-semibold text-black bg-primary-gradient-light mt-2"
          style={{
            background: "linear-gradient(180deg, #F9F6FB 0%, #F8EAEE 100%)",
          }}
          onClick={onClose}
        >
          {t("actions.done")}
        </button>
      </div>
    </div>
  );
};

export default PaymentDoneModal;
