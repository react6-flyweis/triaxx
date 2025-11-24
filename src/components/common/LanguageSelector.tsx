import React, { useEffect, useMemo, useState } from "react";
import { useGetLanguagesQuery } from "@/redux/api/apiSlice";
import DownArrowIcon from "@/assets/header/down_arrow.svg";
import AmericaFlag from "@/assets/flag/america.svg";

interface LanguageItem {
  _id: string;
  Language_name: string;
  Status: boolean;
  Language_id?: number;
}

const FLAG_MAP: Record<string, string> = {
  English: AmericaFlag,
  // add more mappings if needed (e.g. French: FranceFlag)
};

const STORAGE_KEY = "selectedLanguage";

interface Props {
  // Optional className to override the trigger element (language pill) styles
  triggerClassName?: string;
  containerClassName?: string;
}

const LanguageSelector: React.FC<Props> = ({
  triggerClassName = "",
  containerClassName = "",
}) => {
  const { data, isLoading, isError } = useGetLanguagesQuery();
  const languages = data?.data ?? [];

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LanguageItem | null>(null);

  // Initialize from localStorage or server/user default
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LanguageItem;
        setSelected(parsed);
        return;
      }
    } catch {
      // ignore parse errors
    }

    if (languages && languages.length > 0) {
      // choose saved available language or first
      setSelected((prev) => prev ?? languages[0]);
    }
  }, [languages]);

  useEffect(() => {
    if (selected) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    }
  }, [selected]);

  const displayFlag = useMemo(() => {
    if (!selected) return undefined;
    return FLAG_MAP[selected.Language_name] ?? undefined;
  }, [selected]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] cursor-pointer">
        <span className="font-medium">Loading…</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] cursor-pointer">
        <span className="font-medium">Language</span>
      </div>
    );
  }

  return (
    <div className={`relative ${containerClassName}`}>
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] cursor-pointer ${triggerClassName}`}
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-medium">{selected?.Language_name ?? "—"}</span>
        {displayFlag ? (
          <img
            src={displayFlag}
            alt={`${selected?.Language_name} flag`}
            className="h-4 w-6 rounded-sm"
          />
        ) : (
          <div className="h-4 w-6 rounded-sm flex items-center justify-center bg-white text-xs">
            {selected?.Language_name?.slice(0, 2).toUpperCase()}
          </div>
        )}
        <img src={DownArrowIcon} alt="Dropdown" className="h-3 w-3" />
      </div>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-lg overflow-hidden z-50"
        >
          {languages.map((lang) => (
            <li
              key={lang._id}
              role="option"
              aria-selected={selected?._id === lang._id}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                selected?._id === lang._id ? "bg-gray-100 font-medium" : ""
              }`}
              onClick={() => {
                setSelected(lang);
                setOpen(false);
              }}
            >
              {FLAG_MAP[lang.Language_name] ? (
                <img
                  src={FLAG_MAP[lang.Language_name]}
                  alt="flag"
                  className="h-4 w-6 rounded-sm"
                />
              ) : (
                <div className="h-4 w-6 rounded-sm flex items-center justify-center bg-[#f3f4f6] text-xs">
                  {lang.Language_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span>{lang.Language_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
