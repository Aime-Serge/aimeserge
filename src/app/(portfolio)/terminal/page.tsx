import TerminalUI from "@/presentation/components/features/TerminalUI";

export const metadata = {
  title: "Terminal",
  description: "Explore Aime Serge's portfolio by typing commands, for people who like the command line.",
};

export default function TerminalPage() {
  return (
    <div className="container mx-auto flex min-h-[85vh] items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white font-mono">
            Terminal
          </h1>
          <p className="mt-2 text-slate-400">A fun way to browse this site. Type <code className="text-cyan-400">help</code> to see the commands.</p>
        </div>
        <TerminalUI />
      </div>
    </div>
  );
}
