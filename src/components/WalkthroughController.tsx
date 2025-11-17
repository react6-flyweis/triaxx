import React, { useEffect, useRef } from "react";
import { useWalkthroughStore } from "@/store/walkthroughStore";
import { useLocation, useNavigate } from "react-router-dom";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useWalkthroughUIStore } from "@/store/zustandStores";

const driverObj = driver({
  allowClose: false,
  animate: true,
  nextBtnText: "Next",
  prevBtnText: "Back",
  doneBtnText: "Done",
  allowKeyboardControl: true,
  disableActiveInteraction: false,
});

export const WalkthroughControllerNew: React.FC = () => {
  const { steps, currentStep, isActive, trainingInstanceId } =
    useWalkthroughStore();
  const location = useLocation();
  const navigate = useNavigate();
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInstanceIdRef = useRef<number>(trainingInstanceId);

  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      driverObj.destroy();
    };
  }, []);

  useEffect(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
    driverObj.destroy();

    if (!isActive || steps.length === 0) return;

    const step = steps[currentStep];
    if (!step) return;

    lastInstanceIdRef.current = trainingInstanceId;

    if (step.page && step.page !== location.pathname) {
      const existingEl = document.querySelector(step.selector);
      if (!existingEl) {
        navigate(step.page);
        return;
      }
    }

    const showStep = () => {
      if (
        !isActive ||
        steps.length === 0 ||
        lastInstanceIdRef.current !== trainingInstanceId
      )
        return;
      const el = document.querySelector(step.selector);
      if (el) {
        setTimeout(() => {
          driverObj.highlight({
            element: step.selector,
            ...(step.stageRadius !== undefined
              ? { stageRadius: step.stageRadius }
              : {}),
            ...(step.stagePadding !== undefined
              ? { stagePadding: step.stagePadding }
              : {}),
            popover: {
              title: "",
              description: typeof step.content === "string" ? step.content : "",
              side: step.placement || "bottom",
              align: step.align || "start",
              popoverClass: "driverjs-custom-popover",
              onPopoverRender: (popover: any) => {
                if (!popover.description) return;
                popover.description.onclick = null;
                popover.description.style.cursor = "default";
                if (
                  !step.advanceOn ||
                  step.advanceOn === "both" ||
                  step.advanceOn === "description"
                ) {
                  popover.description.style.cursor = "pointer";
                  popover.description.onclick = () => {
                    if (step.setCategory)
                      useWalkthroughUIStore
                        .getState()
                        .setSelectedCategory(step.setCategory);
                    const win = window as Window &
                      typeof globalThis & {
                        handleSelectTable?: () => void;
                        handleRightPanelClick?: () => void;
                      };
                    if (
                      step.selector === ".select-table-prompt" &&
                      typeof win.handleRightPanelClick === "function"
                    ) {
                      win.handleRightPanelClick();
                      useWalkthroughStore.getState().next();
                      return;
                    }
                    if (
                      (step.selector === ".select-table" ||
                        step.selector === ".select-table-panel") &&
                      typeof win.handleSelectTable === "function"
                    ) {
                      win.handleSelectTable();
                      return;
                    }
                    if (
                      step.selector === ".person-floor-panel" &&
                      typeof win.handleSelectTable === "function"
                    ) {
                      win.handleSelectTable();
                      useWalkthroughStore.getState().next();
                      return;
                    }
                    if (step.selector === ".table-btn") {
                      navigate("/table");
                      useWalkthroughStore.getState().next();
                      return;
                    }
                    useWalkthroughStore.getState().next();
                  };
                } else if (step.advanceOn === "ui") {
                  popover.description.style.cursor = "pointer";
                  popover.description.onclick = () => {
                    const elTarget = document.querySelector(
                      step.selector
                    ) as HTMLElement | null;
                    if (elTarget) {
                      try {
                        elTarget.click();
                      } catch (e) {
                        console.error(
                          "[Walkthrough] failed to trigger click on selector:",
                          step.selector,
                          e
                        );
                      }
                    }
                  };
                }
              },
            },
          });
        }, 100);
      } else {
        pollingTimeoutRef.current = setTimeout(showStep, 100);
      }
    };

    showStep();

    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      driverObj.destroy();
    };
  }, [
    steps,
    currentStep,
    isActive,
    location.pathname,
    navigate,
    trainingInstanceId,
  ]);

  useEffect(() => {
    if (!isActive || steps.length === 0) return;
    const step = steps[currentStep];
    if (step && step.onAdvance === "autoCloseAndNavigateHome") {
      setTimeout(() => {
        useWalkthroughStore.getState().complete();
        navigate("/");
      }, 2000);
    }
  }, [steps, currentStep, isActive, navigate]);

  return null;
};

export default WalkthroughControllerNew;
