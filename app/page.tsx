import LoginModule from "./UI/LoginModule";

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center gap-10 rounded-4xl border border-pink-200/70 bg-white/75 p-6 shadow-[0_28px_90px_rgba(190,24,93,0.18)] backdrop-blur xl:p-10">
        <section className="hidden max-w-xl flex-1 rounded-[1.75rem] bg-linear-to-br from-pink-600 via-rose-500 to-sky-500 p-10 text-slate-700 lg:block">
          <p className="text-sm uppercase tracking-[0.4em] text-slate-700">Aerial Coach</p>
          <h1 className="mt-6 text-5xl font-semibold leading-tight">
            Lesson planning, class management, and student progress in one workspace.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-700/80">
            Build reusable conditioning and aerial skill libraries, organize your students into classes,
            and track progress without jumping between different tools.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4 text-sm text-slate-700/85">
            <div className="rounded-2xl border border-pink-300/30 bg-slate-100/18 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">2</p>
              <p className="mt-1">Custom libraries ready to grow</p>
            </div>
            <div className="rounded-2xl border border-pink-300/30 bg-slate-100/18 p-4 backdrop-blur">
              <p className="text-2xl font-semibold">1</p>
              <p className="mt-1">Shared coach dashboard</p>
            </div>
          </div>
        </section>

        <section className="flex w-full max-w-xl justify-center lg:flex-1">
          <LoginModule />
        </section>
      </main>
    </div>
  );
}
