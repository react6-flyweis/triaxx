import React from "react";
import { useTranslation } from "react-i18next";

const Employees: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{t("employees.title")}</h1>
    </div>
  );
};

export default Employees;
