import React from "react";
import { useTranslation } from "react-i18next";
import TriaxxLogoLarge from "@/assets/triaxx_logo_large.svg";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex xl:flex 2xl:flex flex-col px-8 py-4 h-[calc(100vh-112px)] w-[100%]">
      <h1 className="text-3xl font-bold text-gray-800">
        {t("dashboard.welcome")}
      </h1>
      <div className="flex-grow flex items-center justify-center">
        <img
          src={TriaxxLogoLarge}
          alt="TRIAXX Logo"
          className="w-auto h-auto max-w-sm"
        />
      </div>
    </div>
  );
};

export default Dashboard;
