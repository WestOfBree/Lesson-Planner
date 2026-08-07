"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ActionResponseTone = "success" | "error" | "info";

type ActionResponseInput = {
  tone: ActionResponseTone;
  message: string;
  title?: string;
  durationMs?: number;
};

type ActionResponseState = ActionResponseInput & {
  id: number;
};

type ActionResponseContextValue = {
  showActionResponse: (payload: ActionResponseInput) => void;
  clearActionResponse: () => void;
};

const ActionResponseContext = createContext<ActionResponseContextValue | null>(null);

const toneStyles: Record<ActionResponseTone, string> = {
  success: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
  error: "border-rose-200 bg-rose-50/95 text-rose-900",
  info: "border-cyan-200 bg-cyan-50/95 text-cyan-900",
};

const ActionResponsePopup = ({
  payload,
  onDismiss,
}: {
  payload: ActionResponseState;
  onDismiss: () => void;
}) => {
  const headline = payload.title ?? (payload.tone === "success" ? "Success" : payload.tone === "error" ? "Something went wrong" : "Update");

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-60 flex justify-center px-4 sm:bottom-6">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto w-full max-w-xl rounded-2xl border px-4 py-3 shadow-[0_18px_44px_rgba(15,23,42,0.18)] backdrop-blur transition ${toneStyles[payload.tone]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em]">{headline}</p>
            <p className="mt-1 text-sm leading-6">{payload.message}</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className="rounded-full border border-current/20 bg-white/50 px-2 py-1 text-xs font-semibold transition hover:bg-white/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const ActionResponseProvider = ({ children }: { children: ReactNode }) => {
  const [currentResponse, setCurrentResponse] = useState<ActionResponseState | null>(null);

  const clearActionResponse = useCallback(() => {
    setCurrentResponse(null);
  }, []);

  const showActionResponse = useCallback((payload: ActionResponseInput) => {
    setCurrentResponse({ ...payload, id: Date.now() + Math.floor(Math.random() * 1000) });
  }, []);

  useEffect(() => {
    if (!currentResponse) {
      return;
    }

    const timeoutMs = currentResponse.durationMs ?? (currentResponse.tone === "error" ? 5500 : 3200);
    const timeoutId = window.setTimeout(() => {
      setCurrentResponse((active) => (active?.id === currentResponse.id ? null : active));
    }, timeoutMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [currentResponse]);

  const contextValue = useMemo(
    () => ({ showActionResponse, clearActionResponse }),
    [showActionResponse, clearActionResponse],
  );

  return (
    <ActionResponseContext.Provider value={contextValue}>
      {children}
      {currentResponse ? <ActionResponsePopup payload={currentResponse} onDismiss={clearActionResponse} /> : null}
    </ActionResponseContext.Provider>
  );
};

export const useActionResponse = () => {
  const context = useContext(ActionResponseContext);

  if (!context) {
    throw new Error("useActionResponse must be used within ActionResponseProvider");
  }

  return context;
};
