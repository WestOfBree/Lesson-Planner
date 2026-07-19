"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoachApp } from "../lib/coach-store";
import {faEye, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LoginModule() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { signInCoach } = useCoachApp();

  const submitSession = async (mode) => {
    try {
      setErrorMessage("");
      await signInCoach({ email, password, mode });
      router.push("/Landing");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    }
  };

  if (isRegisterMode) {
    return (
      <div className="w-full rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_15px_40px_rgba(15,23,42,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-teal-700">Register</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Create your coach workspace</h2>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => {
              setShowPassword(false);
              setIsRegisterMode(false);
            }}
          >
            Back to login
          </button>
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitSession("register");
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer absolute inset-y-0 right-3 flex items-center text-teal-700 transition hover:text-teal-800"
                onClick={() => setShowPassword((current) => !current)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer w-full rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              Register and continue
            </button>
  
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_15px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-teal-700">Welcome back</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Sign in to Aerial Coach</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Use a guest session to explore the workspace, or sign in with your email to keep your lesson plan and rosters together.
          </p>
        </div>
        <button
          type="button"
          className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          onClick={() => {
            setShowPassword(false);
            setIsRegisterMode(true);
          }}
        >
          Register
        </button>
      </div>

      <div className="mt-8 space-y-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
          onClick={() => submitSession("guest")}
        >
          Continue as a guest coach
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          <span>or sign in</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitSession("login");
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer absolute inset-y-0 right-3 flex items-center text-teal-700 transition hover:text-teal-800"
                onClick={() => setShowPassword((current) => !current)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
