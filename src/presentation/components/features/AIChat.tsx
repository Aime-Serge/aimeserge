"use client";

import { getToolName, isTextUIPart, isToolUIPart, type UIMessage } from 'ai';
import { Bot, X, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { type FormEvent, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/infrastructure/security/headers';
import { useRouter } from 'next/navigation';

const SUGGESTIONS = [
  "Show me your projects",
  "Go to your resume",
  "How do you handle cloud security?",
  "Navigate to contact page"
];

const FOLLOW_UP_SUGGESTIONS: Record<string, string[]> = {
  "projects": ["Tell me about Urban Transport project", "What technologies did you use?", "Go to projects page"],
  "security": ["Show me your security certifications", "How do you implement Zero Trust?", "What is HSTS?"],
  "cloud": ["Which cloud providers do you use?", "Do you use Kubernetes?", "Show me Cloud projects"],
  "contact": ["What is your LinkedIn?", "Send me to the contact form"],
};

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognition;
  webkitSpeechRecognition?: new () => SpeechRecognition;
  webkitAudioContext?: typeof AudioContext;
}

interface LegacyToolCall {
  toolName?: string;
  args?: {
    path?: string;
  };
}

type ChatMessage = UIMessage & {
  content?: string;
  toolCalls?: LegacyToolCall[];
};

function getMessageText(message: ChatMessage): string {
  if (typeof message.content === 'string') {
    return message.content;
  }

  if (!Array.isArray(message.parts)) {
    return '';
  }

  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join('');
}

function readPathFromInput(input: unknown): string | null {
  if (typeof input !== 'object' || input === null) {
    return null;
  }

  const candidatePath = (input as Record<string, unknown>).path;
  return typeof candidatePath === 'string' ? candidatePath : null;
}

function getNavigationPath(message: ChatMessage): string | null {
  const legacyPath = message.toolCalls?.find((toolCall) => toolCall.toolName === 'navigateTo')?.args?.path;
  if (legacyPath) {
    return legacyPath;
  }

  if (!Array.isArray(message.parts)) {
    return null;
  }

  for (const part of message.parts) {
    if (!isToolUIPart(part)) {
      continue;
    }

    if (getToolName(part) !== 'navigateTo') {
      continue;
    }

    const extractedPath = readPathFromInput(part.input);
    if (extractedPath) {
      return extractedPath;
    }
  }

  return null;
}

/**
 * Voice Visualizer Component
 * Provides real-time haptic/visual feedback during voice input and processing.
 */
function VoiceVisualizer({ isActive, isProcessing }: { isActive: boolean; isProcessing?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let dataArray: Uint8Array<ArrayBuffer>;

    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioContextClass = window.AudioContext || (window as WindowWithSpeech).webkitAudioContext;
        if (!AudioContextClass) {
          return;
        }
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 64;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength) as Uint8Array<ArrayBuffer>;

        const draw = () => {
          animationRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const barWidth = (canvas.width / bufferLength) * 2.5;
          let barHeight;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            if (isProcessing) {
              const pulse = Math.sin(Date.now() / 100) * 10 + 20;
              barHeight = pulse;
              ctx.fillStyle = `rgba(16, 185, 129, ${barHeight / 50})`;
            } else {
              ctx.fillStyle = `rgba(6, 182, 212, ${barHeight / 100})`;
            }
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
          }
        };
        draw();
      } catch (err) {
        console.error("Visualizer audio access denied:", err);
      }
    };

    startAudio();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContext) audioContext.close();
    };
  }, [isActive, isProcessing]);

  return <canvas ref={canvasRef} width="100" height="30" className={cn("opacity-80 transition-opacity", isProcessing ? "animate-pulse" : "")} />;
}

interface ConversationWindow {
  id: string;
  messages: UIMessage[];
  title: string;
  timestamp: number;
}

export default function AIChat() {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [lastFollowUps, setLastFollowUps] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationWindow[]>([]);
  const [currentWindowId, setCurrentWindowId] = useState<string>('main');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<'ready' | 'submitted'>('ready');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  // Focus Trap & Keyboard Nav
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
      
      // Basic focus trap
      if (e.key === 'Tab') {
        const focusable = chatRef.current?.querySelectorAll('button, input, [tabindex="0"]');
        if (!focusable) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Audio Feedback Cues
  const playCue = (type: 'start' | 'stop' | 'success') => {
    const frequencies = { start: 440, stop: 330, success: 550 };
    const AudioContextClass = window.AudioContext || (window as unknown as WindowWithSpeech).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(frequencies[type], ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const playTTS = useCallback(async (text: string) => {
    if (!isSpeaking) return;
    try {
      const response = await fetch('/api/v1/ai/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error('TTS failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error('TTS Playback error:', err);
    }
  }, [isSpeaking]);

  const router = useRouter();
  const handleAssistantMessage = useCallback((message: ChatMessage) => {
    const messageText = getMessageText(message);

    if (isSpeaking && messageText) {
      void playTTS(messageText);
    }

    const navigationPath = getNavigationPath(message);
    if (navigationPath) {
      router.push(navigationPath);
    }

    const content = messageText.toLowerCase();
    let foundFollowUps: string[] = [];
    if (content.includes("project")) foundFollowUps = FOLLOW_UP_SUGGESTIONS.projects;
    else if (content.includes("security") || content.includes("protect")) foundFollowUps = FOLLOW_UP_SUGGESTIONS.security;
    else if (content.includes("cloud") || content.includes("aws") || content.includes("gcp")) foundFollowUps = FOLLOW_UP_SUGGESTIONS.cloud;
    else if (content.includes("contact") || content.includes("reach")) foundFollowUps = FOLLOW_UP_SUGGESTIONS.contact;

    setLastFollowUps(foundFollowUps.slice(0, 3));
  }, [isSpeaking, playTTS, router]);

  const sendMessage = useCallback(async ({ text }: { text: string }) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      parts: [{ type: 'text', text }],
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setStatus('submitted');

    try {
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: getMessageText(message),
          })),
        }),
      });

      const data = await response.json() as { id?: string; role?: string; content?: string; error?: string };
      if (!response.ok || !data.content) {
        throw new Error(data.error || 'AI response failed');
      }

      const assistantMessage: ChatMessage = {
        id: data.id || `assistant-${Date.now()}`,
        role: (data.role as UIMessage['role']) || 'assistant',
        content: data.content,
        parts: [{ type: 'text', text: data.content }],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      handleAssistantMessage(assistantMessage);
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'AI response failed';
      const assistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: fallback,
        parts: [{ type: 'text', text: fallback }],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      handleAssistantMessage(assistantMessage);
    } finally {
      setStatus('ready');
    }
  }, [handleAssistantMessage, messages]);

  const isLoading = status === 'submitted';

  // Get current conversation window
  const currentWindow = conversationHistory.find(w => w.id === currentWindowId) || 
    { id: 'main', messages: messages, title: 'Main Chat', timestamp: Date.now() };
  
  const canGoBack = conversationHistory.length > 0 && currentWindowId !== 'main';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    if (messages.length > 0 && currentWindowId === 'main') {
      const newWindow: ConversationWindow = {
        id: `window-${Date.now()}`,
        messages: messages,
        title: messages[0] ? getMessageText(messages[0] as ChatMessage).substring(0, 40) + '...' : 'Untitled Chat',
        timestamp: Date.now(),
      };
      setConversationHistory(prev => [newWindow, ...prev].slice(0, 10));
    }
    setMessages([]);
    setInput('');
    setLastFollowUps([]);
  };

  const goBack = () => {
    if (conversationHistory.length > 0) {
      const previousWindow = conversationHistory[0];
      setCurrentWindowId(previousWindow.id);
      setMessages(previousWindow.messages);
      setInput('');
      setLastFollowUps([]);
    }
  };

  const switchToMainChat = () => {
    setCurrentWindowId('main');
    setInput('');
    setLastFollowUps([]);
  };

  const toggleListening = useCallback(async () => {
    if (isListening) {
      mediaRecorderRef.current?.stop();
      setIsListening(false);
      playCue('stop');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          setInput('Transcribing...');
          const response = await fetch('/api/v1/ai/voice/stt', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          if (data.text) {
            setVoiceTranscript(data.text);
            setInput(data.text);
            void sendMessage({ text: data.text });
            playCue('success');
            setTimeout(() => setVoiceTranscript(''), 3000);
          }
        } catch (err) {
          console.error('STT failed:', err);
          setInput('Transcription failed.');
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setVoiceTranscript('');
      playCue('start');
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access denied. Please check your settings.');
    }
  }, [isListening, sendMessage]);


  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      console.warn('⚠️ Cannot submit: input empty or already loading');
      return;
    }

    console.log('🚀 Sending message:', trimmedInput);
    
    // Send message - ensure it goes through properly
    void sendMessage({ text: trimmedInput });
    setInput('');
    
    // Scroll to bottom after sending
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      {isMounted && (
        <>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className={cn(
              "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition-all duration-300 hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950",
              isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
            )}
          >
            <Bot className="h-6 w-6" />
          </button>

          <div
            role="dialog"
            ref={chatRef}
            aria-label="AI Assistant Chat"
            className={cn(
              "fixed bottom-6 right-6 z-50 flex h-[550px] w-[350px] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:w-[400px]",
              isOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-8 opacity-0"
            )}
          >
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
          <div className="flex items-center gap-3">
            {canGoBack && (
              <button
                onClick={goBack}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-400"
                title="Back to Previous Chat"
              >
                <span className="text-lg">←</span>
              </button>
            )}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">{currentWindow.id === 'main' ? 'Digital Twin Node' : currentWindow.title}</h3>
              <p className="text-[10px] text-slate-500 font-mono">ENCRYPTED_SESSION :: SECURE</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push('/')}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-emerald-400"
              title="Return to Home"
            >
              <span className="text-lg">⌂</span>
            </button>
            <button
              onClick={clearChat}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-amber-400"
              title="Save & Start New Chat"
            >
              <Bot className="h-4 w-4 rotate-180" />
            </button>
            <button
              onClick={() => setIsSpeaking(!isSpeaking)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title={isSpeaking ? "Mute AI" : "Unmute AI"}
            >
              {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Minimize Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
              <Bot className="mb-3 h-10 w-10 opacity-30" />
              <p className="text-sm mb-6">Aime Serge&apos;s Digital Twin.<br/>Grounded exclusively in official project data.</p>
              {currentWindowId !== 'main' && (
                <button
                  onClick={switchToMainChat}
                  className="mb-6 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs text-cyan-400 transition hover:bg-cyan-500/20 hover:border-cyan-500/50"
                >
                  ← Return to Main Chat
                </button>
              )}
              <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                    className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-400 text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => {
            const normalizedMessage = m as ChatMessage;
            const messageText = getMessageText(normalizedMessage);
            const navigationPath = getNavigationPath(normalizedMessage);

            return (
            <div
              key={normalizedMessage.id}
              className={cn(
                "mb-4 flex w-full max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
                normalizedMessage.role === 'user' ? "ml-auto justify-end" : "mr-auto justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  normalizedMessage.role === 'user'
                    ? "bg-cyan-600 text-white rounded-br-sm"
                    : "bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700"
                )}
              >
                {messageText}
                {navigationPath && (
                  <div className="mt-2 border-t border-slate-700 pt-2 text-[10px] italic text-cyan-400">
                    Executing Navigation: {navigationPath}
                  </div>
                )}
                {(normalizedMessage as ChatMessage & { metadata?: { synced?: boolean } }).metadata?.synced && (
                  <div className="mt-2 flex items-center gap-1.5 border-t border-slate-700 pt-2 text-[10px] text-emerald-400 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    SYNC_COMPLETED :: EXTERNAL_NODE_UPDATED
                  </div>
                )}
              </div>
            </div>
          );
          })}
          
          {!isLoading && lastFollowUps.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 justify-start animate-in fade-in slide-in-from-bottom-2">
              {lastFollowUps.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-[10px] text-cyan-400 transition hover:bg-cyan-500/10 hover:border-cyan-500/40"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="mb-4 flex w-full max-w-[85%] justify-start animate-in fade-in">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-cyan-500/30 bg-slate-800/50 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400"></span>
                <span className="text-xs text-cyan-400 ml-2">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-slate-900/50 px-4 py-1 border-t border-slate-800/50">
          <p className="text-[9px] text-slate-600 text-center uppercase tracking-tighter">
            Responsible AI: Responses are grounded in official database nodes. External hallucinations restricted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-900/80 p-3 space-y-2">
          <div className="flex items-center justify-between text-[9px] text-slate-400">
            {currentWindowId !== 'main' && (
              <button
                type="button"
                onClick={switchToMainChat}
                className="hover:text-cyan-400 transition"
              >
                ← Chat History
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/')}
              className="hover:text-emerald-400 transition ml-auto"
            >
              Home ⌂
            </button>
          </div>

          {/* Voice Input Status Indicator */}
          {isListening && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse [animation-delay:0.1s]"></span>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse [animation-delay:0.2s]"></span>
              </div>
              <span className="text-[9px] text-red-400 flex-1">Listening... Recording voice input</span>
            </div>
          )}

          {/* Voice Transcript Display */}
          {voiceTranscript && !isListening && (
            <div className="flex items-start gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-2">
              <span className="text-cyan-400 text-lg">✓</span>
              <div className="flex-1">
                <span className="text-[9px] text-cyan-400 block">Voice captured & ready to send</span>
                <span className="text-[9px] text-slate-300 line-clamp-2">&quot;{voiceTranscript}&quot;</span>
              </div>
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition overflow-hidden",
                isListening 
                  ? "bg-red-500/10 text-red-500 ring-2 ring-red-500/50" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              )}
              title={isListening ? "Stop Listening" : "Voice Input"}
            >
              {isListening ? <MicOff className="h-4 w-4 z-10" /> : <Mic className="h-4 w-4" />}
            </button>
            <div className="relative flex-1 flex items-center">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={isListening ? "Listening..." : isLoading ? "Thinking..." : "Query the system..."}
                className="w-full rounded-full border border-slate-700 bg-slate-800 py-2.5 pl-4 pr-12 text-sm text-white placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                autoComplete="off"
                disabled={isLoading}
              />
              {(isListening || isLoading) && (
                <div className="absolute right-12 pr-2">
                  <VoiceVisualizer isActive={isListening || isLoading} isProcessing={isLoading} />
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading || !input?.trim()}
                className={cn(
                  "absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full transition",
                  isLoading 
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-cyan-600 text-white hover:bg-cyan-500"
                )}
                title={isLoading ? "Waiting for response..." : "Send message"}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
          {isLoading && (
            <div className="text-[9px] text-cyan-400 text-center">
              ↓ Receiving response from Digital Twin...
            </div>
          )}
        </form>
          </div>
        </>
      )}
    </>
  );
}
