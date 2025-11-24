import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface FloorPersonsModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (data: { persons: number; floor: string }) => void;
}

const floors = ["F-01", "F-02", "F-03", "F-04", "F-05", "F-06"];

const FloorPersonsModal: React.FC<FloorPersonsModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [persons, setPersons] = useState(1);
  const [selectedFloor, setSelectedFloor] = useState<string>("F-01");

  const { t } = useTranslation();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.15)] backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white rounded-2xl w-[340px] max-w-full shadow-xl overflow-hidden relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] p-4 text-white rounded-t-2xl">
          <div className="text-xl font-bold">{t("floor.title")}</div>
          <div className="text-sm font-normal">{t("floor.subtitle")}</div>
        </div>
        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="font-semibold mb-2">{t("floor.selectPersons")}</div>
            <div className="flex items-center justify-center gap-2">
              <button
                className="w-10 h-10 rounded-l-lg bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white text-2xl flex items-center justify-center"
                onClick={() => setPersons((p) => Math.max(1, p - 1))}
              >
                –
              </button>
              <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-200 text-lg font-bold">
                {persons}
              </div>
              <button
                className="w-10 h-10 rounded-r-lg bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white text-2xl flex items-center justify-center"
                onClick={() => setPersons((p) => Math.min(20, p + 1))}
              >
                +
              </button>
            </div>
          </div>
          <div className="mb-6">
            <div className="font-semibold mb-2">{t("floor.selectFloor")}</div>
            <div className="grid grid-cols-3 gap-3">
              {floors.map((floor) => (
                <button
                  key={floor}
                  className={`py-3 rounded-lg text-base font-medium shadow-sm transition-all ${
                    selectedFloor === floor
                      ? "bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] text-white"
                      : "bg-[#f7f2fa] text-[#6A1B9A]"
                  }`}
                  onClick={() => setSelectedFloor(floor)}
                >
                  {floor}
                </button>
              ))}
            </div>
          </div>
          <button
            className="w-full py-3 mt-2 rounded-lg text-lg font-semibold text-white bg-gradient-to-r from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all"
            onClick={() => {
              onSelect({ persons, floor: selectedFloor });
              onClose();
            }}
          >
            {t("floor.selectTable")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloorPersonsModal;
