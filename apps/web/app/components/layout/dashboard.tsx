import { Header } from "./header";
import { Inspector } from "./inspector";
import { Sidebar } from "./sidebar";
import { Terminal } from "./terminal";

interface Props {
  children: React.ReactNode;
}

export function Dashboard({ children }: Props) {
  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto">{children}</main>

          <Inspector />
        </div>

        <Terminal />
      </div>
    </div>
  );
}
