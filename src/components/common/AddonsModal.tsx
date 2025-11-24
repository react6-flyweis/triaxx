import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import type { OrderItem } from "@/types/order";
import { useGetItemAddonsQuery } from "@/redux/api/apiSlice";
import type { ItemAddon } from "@/types/addon";

interface AddonsModalProps {
  open: boolean;
  item: OrderItem | null;
  selectedSize: string;
  tableId?: string;
  onClose: () => void;
  onSave: (data: { addons: string[]; note: string }) => void;
}

// We'll fetch addons from server via RTK Query.

const AddonsModal: React.FC<AddonsModalProps> = ({
  open,
  item,
  // selectedSize,
  tableId,
  onClose,
  onSave,
}) => {
  const isWalkthroughActive = useWalkthroughStore((s) => s.isActive);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const { data: addonsResp, isLoading, isError } = useGetItemAddonsQuery();
  const serverAddons: ItemAddon[] = addonsResp?.data ?? [];

  useEffect(() => {
    if (open) {
      setSelectedAddons([]);
      setNote("");
      console.log("[AddonsModal] open for item:", item?.itemId);
    }
  }, [open, item]);

  // Split addons into two groups using server data
  const noPriceAddons = serverAddons.filter(
    (a) => (a.prices ?? 0) === 0 && a.Status
  );
  const withPriceAddons = serverAddons.filter(
    (a) => (a.prices ?? 0) > 0 && a.Status
  );

  const { t } = useTranslation();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      style={{ zIndex: isWalkthroughActive ? 11000 : undefined }}
    >
      <div
        className="absolute inset-0 bg-[rgba(0,0,0,0.15)] backdrop-blur-sm"
        onClick={onClose}
      />
      {open && item && (
        <div className="bg-white rounded-2xl w-[400px] max-w-full shadow-xl overflow-hidden relative z-10 addons-modal">
          {/* Header */}
          <div
            className="rounded-t-2xl py-4 px-6  text-black text-left"
            style={{
              background:
                "linear-gradient(180deg, rgba(106, 27, 154, 0.5) 0%, rgba(211, 47, 47, 0.5) 100%)",
            }}
          >
            <div className="text-2xl font-bold">{t("addons.title")}</div>
            <div className="flex justify-between">
              <div className="text-sm font-semibold">{t("addons.draft")}</div>
              <div className="text-sm font-semibold text-[#3A3A3C]">
                {t("addons.table", { id: tableId ?? "--" })}
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="p-8 pt-6 pb-0">
            <div className="font-bold text-lg text-left mb-6">
              {t("addons.title")}
            </div>
            {/* No price addons inline */}
            <div className="flex flex-row gap-6 mb-4">
              {isLoading ? (
                <div className="text-sm text-gray-500">
                  {t("addons.loading")}
                </div>
              ) : isError ? (
                <div className="text-sm text-red-500">{t("addons.failed")}</div>
              ) : (
                noPriceAddons.map((addon) => (
                  <label
                    key={addon._id}
                    className="flex items-center gap-2 cursor-pointer text-base font-normal addon-item"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(addon.Addons)}
                      onChange={() =>
                        setSelectedAddons((prev) =>
                          prev.includes(addon.Addons)
                            ? prev.filter((a) => a !== addon.Addons)
                            : [...prev, addon.Addons]
                        )
                      }
                      className="accent-[#6A1B9A] w-4 h-4"
                    />
                    <span>{addon.Addons}</span>
                  </label>
                ))
              )}
            </div>
            {/* With price addons stacked */}
            <div className="flex flex-col gap-2 mb-8">
              {isLoading ? (
                <div className="text-sm text-gray-500">&nbsp;</div>
              ) : isError ? (
                <div className="text-sm text-red-500">&nbsp;</div>
              ) : (
                withPriceAddons.map((addon) => (
                  <label
                    key={addon._id}
                    className="flex items-center gap-2 cursor-pointer text-base font-normal addon-item"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(addon.Addons)}
                      onChange={() =>
                        setSelectedAddons((prev) =>
                          prev.includes(addon.Addons)
                            ? prev.filter((a) => a !== addon.Addons)
                            : [...prev, addon.Addons]
                        )
                      }
                      className="accent-[#6A1B9A] w-4 h-4"
                    />
                    <span>{addon.Addons}</span>
                    <span className="text-xs text-[#8E8E93] font-normal">
                      (Extra {addon.prices} XOF)
                    </span>
                  </label>
                ))
              )}
            </div>
            {/* Note section */}
            <div className="mb-8">
              <div className="font-bold mb-2 text-left">{t("addons.note")}</div>
              <textarea
                className="w-full rounded-xl p-4 text-base font-normal focus:outline-none resize-none min-h-[56px] 
                
                bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] placeholder:text-[#00000099]"
                rows={2}
                placeholder={t("addons.notePlaceholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="pb-6" />
          </div>
          {/* Save button remains as is */}
          <div className="px-8 pb-8 pt-2 bg-white">
            <button
              className="w-full py-3 rounded-xl text-lg font-semibold text-white bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] shadow-md hover:opacity-90 transition-all addons-save-btn"
              onClick={() => {
                console.log(
                  "[AddonsModal] onSave clicked with addons:",
                  selectedAddons,
                  "note:",
                  note
                );
                onSave({ addons: selectedAddons, note });
                onClose();
              }}
            >
              {t("addons.save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddonsModal;
