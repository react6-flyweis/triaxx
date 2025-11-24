import React, { useEffect, useMemo, useState } from "react";
import i18n from "@/i18n";
import DownArrowIcon from "@/assets/header/down_arrow.svg";
import AmericaFlag from "@/assets/flag/america.svg";

interface LanguageItem {
  code: string;
  name: string;
}

import FranceFlag from "@/assets/flag/france.svg";

const FLAG_MAP: Record<string, string> = {
  en: AmericaFlag,
  fr: FranceFlag,
};

const STORAGE_KEY = "selectedLanguage";

const SUPPORTED_LANGUAGES: LanguageItem[] = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
];

interface Props {
  // Optional className to override the trigger element (language pill) styles
  triggerClassName?: string;
  containerClassName?: string;
}

const LanguageSelector: React.FC<Props> = ({
  triggerClassName = "",
  containerClassName = "",
}) => {
  // use a local supported language list rather than calling the backend
  const languages = useMemo(() => SUPPORTED_LANGUAGES, []);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LanguageItem | null>(null);

  // Initialize from localStorage or server/user default
  useEffect(() => {
    // initialize selected language code from localStorage or i18n language
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsedCode = raw as string;
        const found =
          languages.find((l) => l.code === parsedCode) ?? languages[0];
        setSelected(found);
        i18n.changeLanguage(found.code).catch(() => {});
        return;
      }
    } catch {
      // ignore
    }

    // fall back to i18n language or first supported lang
    const current = i18n.language ? i18n.language.split("-")[0] : "en";
    const found = languages.find((l) => l.code === current) ?? languages[0];
    setSelected(found || null);
  }, [languages]);

  useEffect(() => {
    if (selected) {
      localStorage.setItem(STORAGE_KEY, selected.code);
    }
  }, [selected]);

  const displayFlag = useMemo(() => {
    if (!selected) return undefined;
    return FLAG_MAP[selected.code] ?? undefined;
  }, [selected]);

  // No remote fetch — always render the selector for supported languages

  return (
    <div className={`relative ${containerClassName}`}>
      <div
        className={`flex items-center gap-3 px-4 py-2 rounded-full bg-[linear-gradient(180deg,rgba(106,27,154,0.1)_0%,rgba(211,47,47,0.1)_100%)] cursor-pointer ${triggerClassName}`}
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="font-medium">{selected?.name ?? "—"}</span>
        {displayFlag ? (
          <img
            src={displayFlag}
            alt={`${selected?.name} flag`}
            className="h-4 w-6 rounded-sm"
          />
        ) : (
          <div className="h-4 w-6 rounded-sm flex items-center justify-center bg-white text-xs">
            {selected?.name?.slice(0, 2).toUpperCase()}
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
              key={lang.code}
              role="option"
              aria-selected={selected?.code === lang.code}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                selected?.code === lang.code ? "bg-gray-100 font-medium" : ""
              }`}
              onClick={() => {
                setSelected(lang);
                setOpen(false);
                i18n.changeLanguage(lang.code).catch(() => {});
              }}
            >
              {FLAG_MAP[lang.code] ? (
                <img
                  src={FLAG_MAP[lang.code]}
                  alt="flag"
                  className="h-4 w-6 rounded-sm"
                />
              ) : (
                <div className="h-4 w-6 rounded-sm flex items-center justify-center bg-[#f3f4f6] text-xs">
                  {lang.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span>{lang.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;
