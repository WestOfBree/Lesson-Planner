"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug, faLightbulb, faMessage } from "@fortawesome/free-solid-svg-icons";

const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_FEEDBACK_ENDPOINT ?? "https://formspree.io/f/mljrdqoz";

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState<"idle" | "success" | "error">("idle");

  const statusClassName = useMemo(() => {
    if (statusTone === "success") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (statusTone === "error") {
      return "border-rose-200 bg-rose-50 text-rose-700";
    }

    return "border-slate-200 bg-slate-50 text-slate-600";
  }, [statusTone]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");
    setStatusTone("idle");

    if (formspreeEndpoint.includes("yourFormId")) {
      setStatusTone("error");
      setStatusMessage("Add your Formspree form URL to NEXT_PUBLIC_FORMSPREE_FEEDBACK_ENDPOINT to enable submissions.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    try {
      setIsSubmitting(true);
      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      event.currentTarget.reset();
      setStatusTone("success");
      setStatusMessage("Thanks for the feedback. We received it.");
    } catch {
      setStatusTone("error");
      setStatusMessage("Unable to send feedback right now. Please try again shortly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open feedback form"
        aria-expanded={isOpen}
        className="fixed right-4 bottom-6 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-cyan-200 bg-white/90 text-cyan-700 shadow-[0_14px_34px_rgba(8,145,178,0.3)] transition hover:border-cyan-300 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
        onClick={() => setIsOpen((current) => !current)}
      >
        <FontAwesomeIcon icon={faMessage} className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Bug report and suggestions"
          className="fixed right-4 bottom-22 z-40 w-[min(24rem,calc(100vw-2rem))] rounded-3xl border border-cyan-200/80 bg-white/95 p-5 shadow-[0_18px_44px_rgba(8,145,178,0.22)] backdrop-blur"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-700">Feedback</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">Report a bug or suggestion</h3>
            </div>
            <button
              type="button"
              aria-label="Close feedback form"
              className="rounded-full border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>

          <form className="mt-4 space-y-3" onSubmit={handleSubmit} action={formspreeEndpoint} method="POST" >
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Type</span>
              <select
                name="feedbackType"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:bg-white"
                required
              >
                <option value="bug">
                  Bug report
                </option>
                <option value="suggestion">
                  Suggestion
                </option>
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Email (optional)</span>
              <input
                type="email"
                name="email"
                placeholder="coach@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Details</span>
              <textarea
                name="message"
                placeholder="Tell us what happened or what feature you want to see."
                className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white"
                required
              />
            </label>

            <input type="hidden" name="_subject" value="Aerial Coach feedback" />

            {statusMessage ? (
              <p className={`rounded-xl border px-3 py-2 text-xs ${statusClassName}`}>{statusMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-300"
            >
              <FontAwesomeIcon icon={faBug} className="h-4 w-4" />
              <FontAwesomeIcon icon={faLightbulb} className="h-4 w-4" />
              {isSubmitting ? "Sending..." : "Send feedback"}
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
};

export default FeedbackWidget;