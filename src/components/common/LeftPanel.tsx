import React from "react";
import LanguageSelector from "@/components/common/LanguageSelector";

interface LeftPanelProps {
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  children?: React.ReactNode;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  heading = (
    <h1 className="text-[#002B6B] font-bold text-4xl">
      POS that works as hard as you. <br />
      and Faster than you.
    </h1>
  ),
  subheading = (
    <p className="mt-6 text-lg text-[#414D60] max-w-md">
      Grow without limit with{" "}
      <span className="text-primary-gradient">Triaxx</span> and Make timely and
      accurate decision with real-time reports
    </p>
  ),
  children,
}) => {
  return (
    <div className="hidden lg:relative lg:flex lg:w-3/5 flex-col justify-center items-center text-center text-white p-12 gradient-background">
      <div>
        {heading}
        {subheading}
        {children}
      </div>
      <div className="lg:absolute mt-8 lg:top-130 lg:left-12">
        <div className="bg-white/90 text-[#372B4C] px-4 py-3 rounded-lg flex items-center text-sm font-medium shadow-md">
          <LanguageSelector triggerClassName="bg-transparent px-0 py-0 rounded-none shadow-none" />
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
