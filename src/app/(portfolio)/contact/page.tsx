"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, Send, User, Building2, Briefcase, Globe, Info, Clock, DollarSign, Linkedin, Zap, Phone, Heart, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { submitContactForm } from "@/core/domain/interactions/actions";
import { toast } from "react-hot-toast";
import { type ContactSubmission } from "@/core/domain/interactions/actions";
import { cn } from "@/infrastructure/security/headers";

/**
 * Newsletter Subscription Modal
 */
function NewsletterModal({ isOpen, onChoice }: { isOpen: boolean; onChoice: (subscribe: boolean) => void }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/40">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl overflow-hidden text-center"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/10 blur-2xl rounded-full -mr-12 -mt-12" />
          
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
              <Mail className="h-8 w-8 animate-bounce" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Sync Updates?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Would you like to receive automated broadcasts on system updates, security research, and architectural insights?
            </p>

            <div className="grid gap-3">
              <button
                onClick={() => onChoice(true)}
                className="w-full rounded-xl bg-cyan-600 py-3.5 font-bold text-white transition hover:bg-cyan-500 hover:shadow-[0_0_15px_rgba(8,145,178,0.4)] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Yes, Subscribe Me
              </button>
              <button
                onClick={() => onChoice(false)}
                className="w-full rounded-xl border border-slate-800 bg-slate-800/50 py-3.5 font-bold text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                Just Send Message
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function ContactPage() {
  const [step, setStep] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [formData, setFormData] = useState<ContactSubmission>({
    name: "",
    email: "",
    contactType: "Individual",
    companyName: "",
    jobTitle: "",
    interest: "Collaboration",
    budget: "",
    timeline: "",
    location: "",
    linkedinUrl: "",
    whatsapp: "",
    gender: "Prefer not to say",
    maritalStatus: "Single",
    message: "",
    newsletterOptIn: false,
  });

  useEffect(() => {
    if (formData.contactType === "Individual") {
      setFormData(prev => ({ ...prev, companyName: "", jobTitle: "", budget: "" }));
    } else {
      setFormData(prev => ({ ...prev, timeline: "" }));
    }
  }, [formData.contactType]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      console.warn("Bot detected via honeypot.");
      toast.success("Message transmitted successfully."); // Silent discard
      return;
    }
    setShowNewsletterModal(true);
  };

  const handleFinalSubmission = async (subscribe: boolean) => {
    setShowNewsletterModal(false);
    setIsPending(true);
    
    const finalData = { ...formData, newsletterOptIn: subscribe };
    
    try {
      const result = await submitContactForm(finalData);
      if (result.success) {
        toast.success(result.message);
        setStep(1);
        setFormData({
          name: "",
          email: "",
          contactType: "Individual",
          companyName: "",
          jobTitle: "",
          interest: "Collaboration",
          budget: "",
          timeline: "",
          location: "",
          linkedinUrl: "",
          whatsapp: "",
          gender: "Prefer not to say",
          maritalStatus: "Single",
          message: "",
          newsletterOptIn: false,
        });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Handshake timed out. Check network integrity.");
    } finally {
      setIsPending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto px-6 py-12 lg:py-20">
      <NewsletterModal isOpen={showNewsletterModal} onChoice={handleFinalSubmission} />

      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs uppercase tracking-[0.3em] mb-4">
              <Shield className="h-3.5 w-3.5 animate-pulse" />
              Secure_Comm_Channel
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Initiate <span className="text-cyan-500">Contact</span>
            </h1>
            <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-xl">
              Sync with my digital node for collaborations, research, or enterprise cloud solutions. 
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-500">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Protocol Node</p>
                <p className="text-lg font-bold text-white">aimeserge51260@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-500">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Response Latency</p>
                <p className="text-sm font-medium text-slate-300">T-minus 24-48 hours</p>
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          layout
          className="relative rounded-3xl border border-slate-800 bg-slate-950/50 p-8 md:p-10 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-900">
             <motion.div 
                className="h-full bg-cyan-500" 
                animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
             />
          </div>

          {/* Bot Honeypot (Hidden) */}
          <input 
            type="text" 
            name="system_id" 
            value={honeypot} 
            onChange={(e) => setHoneypot(e.target.value)} 
            className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none" 
            aria-hidden="true" 
          />

          <form onSubmit={handleInitialSubmit} className="space-y-8 relative z-10">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Step 01 // Identity_Handshake</span>
                    <Zap className="h-4 w-4 text-cyan-500" />
                  </div>

                  <div className="relative flex p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-8">
                    <motion.div
                      animate={{ x: formData.contactType === "Individual" ? "0%" : "100%" }}
                      className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-cyan-600"
                    />
                    <button type="button" onClick={() => setFormData(p => ({ ...p, contactType: "Individual" }))} className={cn("relative z-10 flex-1 py-3 text-[10px] font-bold uppercase transition", formData.contactType === "Individual" ? "text-white" : "text-slate-500")}>Individual</button>
                    <button type="button" onClick={() => setFormData(p => ({ ...p, contactType: "Business" }))} className={cn("relative z-10 flex-1 py-3 text-[10px] font-bold uppercase transition", formData.contactType === "Business" ? "text-white" : "text-slate-500")}>Business</button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">Full_Name</label>
                      <input required name="name" value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="Aime Serge" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">Email_Node</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="serge@node.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">WhatsApp</label>
                      <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="+250..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">Origin_Location</label>
                      <input name="location" value={formData.location} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="Kigali, Rwanda" />
                    </div>
                  </div>

                  <button type="button" onClick={nextStep} className="w-full rounded-xl bg-slate-800 py-4 font-bold text-white hover:bg-slate-700 transition flex items-center justify-center gap-2">
                    CONTINUE TO MISSION <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Step 02 // Mission_Requirements</span>
                    <Briefcase className="h-4 w-4 text-cyan-500" />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {formData.contactType === "Business" ? (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-500 uppercase">Company</label>
                          <input name="companyName" value={formData.companyName} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="Entity Name" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-500 uppercase">Budget_Range</label>
                          <input name="budget" value={formData.budget} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="e.g. $5k+" />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-slate-500 uppercase">Timeline</label>
                        <input name="timeline" value={formData.timeline} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="e.g. 2 weeks" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">Inquiry_Type</label>
                      <select name="interest" value={formData.interest} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none appearance-none">
                        <option value="Collaboration">Collaboration</option>
                        <option value="Hiring">Hiring</option>
                        <option value="Research">Research</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-slate-500 uppercase">LinkedIn_Link</label>
                      <input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="linkedin.com/in/..." />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={prevStep} className="flex-1 rounded-xl border border-slate-800 py-4 font-bold text-slate-400 hover:bg-slate-900 transition flex items-center justify-center gap-2">
                      <ArrowLeft className="h-4 w-4" /> BACK
                    </button>
                    <button type="button" onClick={nextStep} className="flex-[2] rounded-xl bg-slate-800 py-4 font-bold text-white hover:bg-slate-700 transition flex items-center justify-center gap-2">
                      FINAL PAYLOAD <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Step 03 // Final_Transmission</span>
                    <Send className="h-4 w-4 text-cyan-500" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase">Message_Payload</label>
                    <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none" placeholder="Describe your vision..." />
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={prevStep} className="flex-1 rounded-xl border border-slate-800 py-4 font-bold text-slate-400 hover:bg-slate-900 transition flex items-center justify-center gap-2">
                      <ArrowLeft className="h-4 w-4" /> BACK
                    </button>
                    <button disabled={isPending} className="flex-[2] rounded-xl bg-cyan-600 py-4 font-bold text-white hover:bg-cyan-500 transition shadow-[0_0_20px_rgba(8,145,178,0.3)] disabled:opacity-50">
                      {isPending ? "TRANSMITTING..." : "TRANSMIT INQUIRY"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
