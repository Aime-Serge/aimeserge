"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Shield, Send, User, Building2, Briefcase, Globe, Info, Clock, DollarSign, Linkedin, Zap, Phone, Heart, CheckCircle2 } from "lucide-react";
import { submitContactForm } from "@/domain/interactions/actions";
import { toast } from "react-hot-toast";
import { type ContactSubmission } from "@/domain/interactions/actions";
import { cn } from "@/infrastructure/security/headers";

/**
 * Newsletter Subscription Modal
 * Fits the Cyber-Cloud aesthetic.
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
          {/* Decoration */}
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
            
            <p className="mt-6 text-[10px] font-mono text-slate-600 uppercase tracking-tighter">
              Responsible AI: You can unsubscribe at any protocol node.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default function ContactPage() {
  const [isPending, setIsPending] = useState(false);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
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

  // Clean up conditional fields when type changes
  useEffect(() => {
    if (formData.contactType === "Individual") {
      setFormData(prev => ({ 
        ...prev, 
        companyName: "", 
        jobTitle: "", 
        budget: "" 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        timeline: "" 
      }));
    }
  }, [formData.contactType]);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        if (subscribe) toast.success("Newsletter subscription active!");
        
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
        {/* Information Column */}
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
              From individual research collaborations to enterprise-grade cloud transformations, 
              provide your deployment requirements below to synchronize.
            </p>
          </div>

          <div className="grid gap-6">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition hover:border-cyan-500/30">
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
                <Info className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Response Latency</p>
                <p className="text-sm font-medium text-slate-300">T-minus 24-48 hours (GMT+2)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <motion.div 
          initial={false}
          animate={{
            borderColor: formData.contactType === "Business" ? "rgba(16, 185, 129, 0.3)" : "rgba(8, 145, 178, 0.3)",
          }}
          className="relative rounded-3xl border border-slate-800 bg-slate-950/50 p-8 md:p-10 backdrop-blur-xl shadow-2xl transition-colors duration-500"
        >
          {/* Status Indicator Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-4 py-1 text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400 shadow-xl z-20">
            <Zap className={cn("h-3 w-3", formData.contactType === "Business" ? "text-emerald-500" : "text-cyan-500")} />
            Mode: {formData.contactType}
          </div>

          <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <form onSubmit={handleInitialSubmit} className="space-y-8 relative z-10">
            {/* Type Selection Toggle */}
            <div className="relative flex p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-inner overflow-hidden">
              <motion.div
                initial={false}
                animate={{
                  x: formData.contactType === "Individual" ? "0%" : "100%",
                }}
                className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 shadow-[0_0_20px_rgba(8,145,178,0.4)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, contactType: "Individual" }))}
                className={cn(
                  "relative z-10 flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors duration-300",
                  formData.contactType === "Individual" ? "text-white" : "text-slate-500 hover:text-slate-400"
                )}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, contactType: "Business" }))}
                className={cn(
                  "relative z-10 flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors duration-300",
                  formData.contactType === "Business" ? "text-white" : "text-slate-500 hover:text-slate-400"
                )}
              >
                Business
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                  <User className="h-3 w-3" /> Name
                </label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                  <Mail className="h-3 w-3" /> Email_Node
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="your@email.com"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                  <Phone className="h-3 w-3" /> WhatsApp_Node
                </label>
                <input
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 transition-all"
                  placeholder="+250..."
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                  <Globe className="h-3 w-3" /> Origin_Location
                </label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500"
                  placeholder="City, Country"
                />
              </div>

              {/* Gender Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                  <User className="h-3 w-3" /> Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Marital Status Select */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                  <Heart className="h-3 w-3" /> Marital_Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {formData.contactType === "Business" && (
                <>
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                      <Building2 className="h-3 w-3" /> Company
                    </label>
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500"
                      placeholder="Company Name"
                    />
                  </div>
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                      <Briefcase className="h-3 w-3" /> Job Title
                    </label>
                    <input
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500"
                      placeholder="e.g. CTO, Manager"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                  <Briefcase className="h-3 w-3" /> Inquiry Type
                </label>
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="Collaboration">Collaboration</option>
                  <option value="Hiring">Hiring / Full-Time</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Research">Research Partnership</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                  <Linkedin className="h-3 w-3" /> Profile Link
                </label>
                <input
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500"
                  placeholder="linkedin.com/in/..."
                />
              </div>

              {formData.contactType === "Business" ? (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                    <DollarSign className="h-3 w-3" /> Budget_Range
                  </label>
                  <input
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500"
                    placeholder="e.g. $5k - $10k"
                  />
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                    <Clock className="h-3 w-3" /> Timeline
                  </label>
                  <input
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500"
                    placeholder="e.g. Next month"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase">
                Payload_Details
              </label>
              <textarea
                required
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Describe your requirements or partnership vision..."
              />
            </div>

            <button
              disabled={isPending}
              className="group w-full rounded-xl bg-cyan-600 py-4 font-bold text-white transition-all hover:bg-cyan-700 hover:shadow-[0_0_20px_rgba(8,145,178,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" /> ENCRYPTING TRANSMISSION...
                </span>
              ) : (
                <>
                  TRANSMIT INQUIRY
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
