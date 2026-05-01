"use client";

import { useState, useRef } from "react";
import { Play, Pause, Volume2, Loader2 } from "lucide-react";

interface BroadcastAudioPlayerProps {
  text: string;
  title: string;
}

export default function BroadcastAudioPlayer({ text, title }: BroadcastAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTogglePlay = async () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/ai/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: `Now broadcasting: ${title}. ${text}`,
          voice: "onyx" // Deep, technical voice
        }),
      });

      if (!response.ok) throw new Error("Audio generation failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Audio Playback Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 mb-8">
      <button
        onClick={handleTogglePlay}
        disabled={isLoading}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 text-white transition hover:bg-cyan-500 disabled:opacity-50"
        aria-label={isPlaying ? "Pause Broadcast" : "Listen to Broadcast"}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Audio_Stream_Available</span>
          {isPlaying && <span className="flex gap-0.5 h-2 items-end">
            <span className="w-0.5 bg-cyan-500 animate-[bounce_0.5s_infinite]"></span>
            <span className="w-0.5 bg-cyan-500 animate-[bounce_0.7s_infinite]"></span>
            <span className="w-0.5 bg-cyan-500 animate-[bounce_0.6s_infinite]"></span>
          </span>}
        </div>
        <p className="text-xs text-slate-400 font-mono">Synthesizing Digital Twin Voice Architecture...</p>
      </div>

      <div className="hidden sm:block">
        <Volume2 className="h-4 w-4 text-slate-600" />
      </div>
    </div>
  );
}
