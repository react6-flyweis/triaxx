import React from "react";
import mailIcon from "@/assets/setting/Mail.svg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FAQAccordion from "./FAQAccordion";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { profileTrainingSteps } from "@/walkthrough/steps";

const ContactSupport: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settingsHighlight, setSettingsHighlight, startTraining } =
    useWalkthroughStore();

  React.useEffect(() => {
    if (settingsHighlight === "contact-support") {
      const timer = setTimeout(() => {
        setSettingsHighlight("");
        navigate("/");
        setTimeout(() => {
          startTraining("profile", profileTrainingSteps);
        }, 500); // slight delay to ensure navigation
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [settingsHighlight, setSettingsHighlight, navigate, startTraining]);

  return (
    <div className="p-6 md:p-10 min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <span
          className="text-[#00000099] font-bold text-[32px] cursor-pointer"
          onClick={() => navigate("/settings")}
        >
          {t("settings.title")}
        </span>
        <span className="text-black font-bold  text-[32px]">
          &gt; {t("support.contact.title")}
        </span>
      </div>
      {/* Main Content */}
      <div className="flex flex-col gap-8 contact-support-highlight">
        {/* Need Help Card */}
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          <div className="border rounded-3xl p-6 flex-1 max-w-[420px] flex flex-col justify-between">
            <div>
              <div className="font-bold text-xl mb-2">
                {t("support.contact.helpTitle")}
              </div>
              <div className="text-sm text-black/80 mb-2">
                {t("support.contact.helpBody")}
                <br />
                <span className="font-bold">
                  {t("support.contact.emailLabel")} hi@uiflow.in
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-t from-[#D32F2F] to-[#6A1B9A] text-white font-semibold text-base shadow">
              <img src={mailIcon} alt="mail" className="w-6 h-6" />
              hi@uiflow.in
            </div>
          </div>
        </div>
        {/* Support Ticket Card */}
        <div className="flex-1 max-w-[420px] border border-[#00000099] rounded-3xl p-6 flex flex-col items-center">
          <div className="font-bold text-2xl mb-6">
            {t("support.tickets.title")}
          </div>
          <button
            className="w-full max-w-xs py-2 rounded-lg font-semibold text-white text-base mb-6 bg-gradient-to-t from-[#D32F2F] to-[#6A1B9A] shadow"
            onClick={() => navigate("/settings/create-ticket")}
          >
            {t("support.tickets.create")}
          </button>
          <div className=" gradient-border ">
            <button
              className="w-[320px] max-w-xs rounded-lg font-semibold  gradient-border-inner bg-white"
              onClick={() => navigate("/settings/tickets")}
            >
              {t("support.tickets.viewRaised")}
            </button>
          </div>
        </div>
        {/* FAQ Section */}
        <div className="mt-12">
          <div className="text-3xl font-bold mb-8">
            {t("support.faqs.title")}
          </div>
          <FAQAccordion />
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
