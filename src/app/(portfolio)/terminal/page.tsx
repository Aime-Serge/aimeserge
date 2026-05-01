import TerminalUI from "@/presentation/components/features/TerminalUI";

export const metadata = {
  title: "Terminal | Aime Serge UKOBIZABA",
  description: "Command-line interface to explore my engineering portfolio.",
};

export default function TerminalPage() {
  return (
    <div className="container mx-auto flex min-h-[85vh] items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
            &gt; System<span className="text-cyan-500 animate-pulse">_</span>Terminal
          </h1>
          <p className="mt-2 text-slate-400">Execute commands to explore the architecture.</p>
        </div>
        <TerminalUI />
      </div>
    </div>
  );
}
