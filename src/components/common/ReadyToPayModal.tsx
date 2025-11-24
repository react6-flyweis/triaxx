import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import readyToPayIcon from "@/assets/payment/readytopay.svg";

interface ReadyToPayModalProps {
  onClose: () => void;
}

const ReadyToPayModal: React.FC<ReadyToPayModalProps> = ({ onClose }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center bg-black/10">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center w-[320px] ready-to-pay-modal">
        <div className="text-2xl font-bold mb-2">
          {t("orders.ready.toPay.title")}
        </div>
        <div className="text-center text-base mb-6 text-black/80">
          {t("orders.ready.toPay.description")}
        </div>
        <img
          src={readyToPayIcon}
          alt="Ready to Pay"
          className="w-20 h-20 mb-8"
        />
        <button
          className="w-full py-3 rounded-xl text-lg font-semibold text-black bg-primary-gradient-light mt-2"
          style={{
            background: "linear-gradient(180deg, #F9F6FB 0%, #F8EAEE 100%)",
          }}
        >
          {t("actions.cancel")}
        </button>
      </div>
    </div>
  );
};

export default ReadyToPayModal;
