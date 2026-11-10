"use client";

import { useState } from "react";
import { Radio, Cpu, CheckCircle2 } from "lucide-react";
import { subscribeNewsletter } from "@/core/domain/interactions/mutations";
import { toast } from "react-hot-toast";

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    const result = await subscribeNewsletter(email);

    if (result.success) {
      toast.success(result.message);
      setIsSubscribed(true);
    } else {
      toast.error(result.message);
    }
    setIsPending(false);
  };

  if (isSubscribed) {
    return (
      <div className="mx-auto max-w-xl space-y-4 rounded-2xl bg-emerald-500/10 p-8 border border-emerald-500/30 shadow-2xl text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
        <h3 className="text-xl font-bold text-white uppercase tracking-widest font-mono">You&apos;re subscribed</h3>
        <p className="text-emerald-400/80 text-sm">Thanks! New articles will arrive in your inbox, about once a month.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl bg-[#010409] p-8 border border-slate-800 shadow-2xl">
      <Radio className="mx-auto h-8 w-8 text-cyan-500 animate-pulse" />
      <h3 className="text-xl font-bold text-white uppercase tracking-widest font-mono">Get new articles by email</h3>
      <p className="text-slate-400 text-sm">About one email a month when I publish something new. No spam, unsubscribe any time.</p>
      
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 mt-6">
        <input 
          required
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="Your email address" 
          className="flex-1 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
        <button 
          disabled={isPending}
          className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Cpu className="h-4 w-4 animate-spin" />
              Subscribing…
            </>
          ) : (
            "Subscribe"
          )}
        </button>
      </form>
    </div>
  );
}
