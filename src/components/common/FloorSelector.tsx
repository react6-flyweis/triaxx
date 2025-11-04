import React, { useEffect, useState } from "react";
import { getAllFloors } from "@/api/floorApi";
import type { FloorType } from "@/api/floorApi";

type Props = {
  selectedFloor?: string | null;
  onSelect: (floorName: string) => void;
  className?: string;
};

const FloorSelector: React.FC<Props> = ({
  selectedFloor,
  onSelect,
  className,
}) => {
  const [floors, setFloors] = useState<FloorType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllFloors();
        if (!mounted) return;
        setFloors(res || []);
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load floors");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center py-4 ${className || ""}`}
      >
        <div className="w-10 h-10 border-4 border-t-4 border-gray-200 border-t-[#6A1B9A] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center text-sm text-red-500 ${className || ""}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 sm:gap-3 ${className || ""}`}>
      {floors.map((floor) => {
        const key = floor.Floor_Name + (floor.Floor_Type_id ?? "");
        const emoji = floor.Floor_Type_id?.emozi || "";
        const label = floor.Floor_Name || "Unnamed Floor";
        const isSelected = selectedFloor === label;
        return (
          <button
            key={key}
            className={`py-2 px-1  rounded-lg text-base font-medium shadow-sm transition-all ${
              isSelected
                ? "bg-gradient-to-b from-[#6A1B9A] to-[#D32F2F] text-white"
                : "bg-[#f7f2fa]"
            }`}
            onClick={() => onSelect(label)}
          >
            <div className="flex items-center justify-center gap-1">
              {emoji && <span className="text-sm">{emoji}</span>}
              <span className="text-nowrap text-xs">{label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default FloorSelector;
