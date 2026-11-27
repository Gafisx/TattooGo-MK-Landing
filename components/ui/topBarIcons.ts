import {
  CalendarDays,
  Compass,
  Crown,
  Download,
  FileText,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  LogIn,
  Map,
  MessageSquare,
  Palette,
  Shield,
  Smartphone,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { TopBarIconKey } from "@/lib/topBarConfig";

/**
 * Tradução das chaves tipadas do contrato para os ícones reais.
 * `Icon`/`Lock` ficam reservados para o Passo 2 (ações de portfólio/privacidade).
 */
export const TOP_BAR_ICONS: Record<TopBarIconKey, LucideIcon> = {
  users: Users,
  palette: Palette,
  download: Download,
  help: LifeBuoy,
  feedback: MessageSquare,
  shield: Shield,
  terms: FileText,
  mobile: Smartphone,
  layers: Layers,
  crown: Crown,
  compass: Compass,
  sparkles: Sparkles,
  map: Map,
  budget: Wallet,
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  portfolio: Layers,
  login: LogIn,
  lock: Shield,
};
