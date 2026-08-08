export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-b-zinc-800 bg-zinc-950 px-6">
      <h1>Terminal Agent</h1>
      <div className="flex items-center gap-3">
        <button className="rounded-md bg-zinc-800 px-3 py-2 text-sm text-white hover:bg-zinc-700">
          Settings
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
          A
        </div>
      </div>
    </header>
  );
}
