import React from "react";
import { useTranslation } from "react-i18next";

const Payments: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{t("payment.title")}</h1>
    </div>
  );
};

export default Payments;
