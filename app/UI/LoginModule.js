"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoachApp } from "@/app/lib/coach-store";
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

  const resolveAuthErrorMessage = (error) => {
    if (!(error instanceof Error)) {
      return "Unable to sign in.";
    }

    if (error.code === "auth/configuration-not-found") {
      return "Firebase Email/Password authentication is not enabled for this project. Turn it on in the Firebase console, then try again.";
    }

    return error.message || "Unable to sign in.";
  };

  const submitSession = async (mode) => {
    try {
      setErrorMessage("");
      await signInCoach({ email, password, mode });
      router.push("/Landing");
    } catch (error) {
      setErrorMessage(resolveAuthErrorMessage(error));
    }
  };

  if (isRegisterMode) {
    return (
      <div className="w-full rounded-4xl border border-rose-200/70 bg-linear-to-br from-white via-rose-50/80 to-pink-50/80 p-8 text-slate-950 backdrop-blur">
        <div className="flex items-center justify-between gap-4 border-b border-rose-100 pb-5">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Register</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Create your coach workspace</h2>
          </div>
          <button
            type="button"
            className="cursor-pointer rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-500 hover:bg-linear-to-r hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-600 hover:text-white"
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

          {errorMessage ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

            <span className="text-sm font-medium text-slate-800">Email</span>
            <input
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-rose-200/80 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white"
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-rose-200/80 bg-white px-4 py-3 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer absolute inset-y-0 right-3 flex items-center text-rose-700 transition hover:text-rose-900"
                onClick={() => setShowPassword((current) => !current)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              className="cursor-pointer w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 font-semibold text-rose-700 transition hover:border-rose-500 hover:bg-linear-to-r hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-600 hover:text-white"
            >
              Register and continue
            </button>
  
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full rounded-4xl border border-rose-200/70 bg-linear-to-br from-white via-rose-50/70 to-pink-50/80 p-8 text-slate-950 backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b border-rose-100 pb-5">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-rose-700">Welcome back</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Sign in to Aerial Coach</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Use a guest session to explore the workspace, or sign in with your email to keep your lesson plan and rosters together.
          </p>
        </div>
        <button
          type="button"
          className="cursor-pointer rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-700 transition hover:border-rose-500 hover:bg-linear-to-r hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-600 hover:text-white"
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
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3 font-semibold text-rose-700 transition hover:border-rose-500 hover:bg-linear-to-r hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-600 hover:text-white"
          onClick={() => submitSession("guest")}
        >
          Continue as a guest coach
        </button>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
          <span className="h-px flex-1 bg-rose-100" />
          <span>or sign in</span>
          <span className="h-px flex-1 bg-rose-100" />
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitSession("login");
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800">Email</span>
            <input
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-rose-200/80 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-800">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-rose-200/80 bg-white px-4 py-3 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer absolute inset-y-0 right-3 flex items-center text-rose-700 transition hover:text-rose-900"
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
            className="w-full rounded-2xl border border-rose-200 bg-white px-4 py-3 font-semibold text-rose-700 transition hover:border-rose-500 hover:bg-linear-to-r hover:from-rose-600 hover:via-pink-600 hover:to-fuchsia-600 hover:text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
