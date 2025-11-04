import { useState } from "react";
import { useGetFaqsQuery } from "../../redux/api/apiSlice";

// interface FAQItem {
//   id: number;
//   question: string;
//   answer: string;
// }

// interface FAQSection {
//   heading: string;
//   items: FAQItem[];
// }

// Local fallback before data loads or if API fails to return useful items
const FALLBACK_HEADING = "Frequently asked questions";

const FAQAccordion = () => {
  const [openIds, setOpenIds] = useState<number[]>([]);
  const {
    data: faqsResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetFaqsQuery();

  // map server items into local display items
  const faqItems = faqsResponse?.data ?? [];
  const toggleAccordion = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((openId) => openId !== id) : [...prev, id]
    );
  };
  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="text-xl font-bold mb-4">{FALLBACK_HEADING}</div>

        {/* Loading skeleton */}
        {(isLoading || isFetching) && (
          <div className="flex flex-col gap-4 mt-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex flex-col bg-[#F9F9F9] rounded-md p-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gray-300 rounded" />
                  <div className="h-6 bg-gray-300 rounded flex-1" />
                  <div className="w-10 h-10 bg-gray-300 rounded-full" />
                </div>
                <div className="h-4 bg-gray-300 rounded mt-4 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-red-600 mt-2">
            Failed to load FAQs. Please try again.
          </div>
        )}

        {!isLoading && !isError && (
          <div className="flex flex-col gap-6 mt-2">
            {faqItems.length === 0 && (
              <div className="text-sm text-gray-600">No FAQs found.</div>
            )}
            {faqItems.map((item, idx) => {
              // we use index for numeric label, and _id to track open
              const numericId = idx + 1;
              const isOpen = openIds.includes(idx);
              return (
                <div
                  key={item._id}
                  className="flex flex-col"
                  style={
                    isOpen
                      ? { background: "#F8EAEE" }
                      : { background: "#F9F9F9" }
                  }
                >
                  <div
                    className={`flex items-center px-8 py-6 rounded-md transition cursor-pointer`}
                  >
                    <div className="flex items-center gap-6 w-full">
                      <div className="text-3xl font-bold text-[#9D96A8] w-12 text-center select-none">
                        {String(numericId).padStart(2, "0")}
                      </div>
                      <div className="flex-1 text-lg font-medium text-black">
                        {item.faq_question}
                      </div>
                      <button
                        className={`w-10 h-10 flex items-center font-extralight justify-center rounded-full ${
                          !isOpen ? "bg-[#F8EAEE]" : "bg-white"
                        } text-2xl font-bold  focus:outline-none transition-colors`}
                        tabIndex={-1}
                        type="button"
                        onClick={() => toggleAccordion(idx)}
                        aria-label={isOpen ? "Collapse" : "Expand"}
                      >
                        {isOpen ? "-" : "+"}
                      </button>
                    </div>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                    style={{
                      paddingLeft: isOpen ? 80 : 80,
                      paddingRight: 32,
                      paddingBottom: isOpen ? 24 : 0,
                    }}
                  >
                    <div className="text-black text-lg">{item.faq_answer}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQAccordion;
