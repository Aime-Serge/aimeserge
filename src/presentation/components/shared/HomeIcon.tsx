import {
  Lightbulb, Microscope, ShieldCheck, Sprout, User, Users, Store, Ear, Hammer, TrendingUp, Trophy,
  Briefcase, Handshake, FlaskConical, HeartPulse, Flame, Globe, Rocket, Code, Brain, GraduationCap,
  Building2, Leaf, Lock, Target, Award, Cpu, Smartphone, BookOpen, Megaphone, type LucideIcon,
} from "lucide-react";
import type { HomeIconName } from "@/config/homepage";

export const HOME_ICON_COMPONENTS: Record<HomeIconName, LucideIcon> = {
  Lightbulb, Microscope, ShieldCheck, Sprout, User, Users, Store, Ear, Hammer, TrendingUp, Trophy,
  Briefcase, Handshake, FlaskConical, HeartPulse, Flame, Globe, Rocket, Code, Brain, GraduationCap,
  Building2, Leaf, Lock, Target, Award, Cpu, Smartphone, BookOpen, Megaphone,
};

/** Renders an icon chosen in the admin by name. Unknown names fall back to a lightbulb. */
export default function HomeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = HOME_ICON_COMPONENTS[name as HomeIconName] ?? Lightbulb;
  return <Icon className={className} aria-hidden="true" />;
}
