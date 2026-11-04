import {
  Activity,
  BookOpen,
  Bot,
  ClipboardList,
  FileSearch,
  Gauge,
  GitBranch,
  Globe,
  IdCard,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProductIcon } from '@/content/brand/types';

/**
 * One glyph per product kind, shared by the catalogue cards and the navigation
 * rows. A product may only be drawn from this table, so the icon a card shows
 * is the icon the menu shows for the same system.
 */
export const PRODUCT_ICONS = {
  register: ClipboardList,
  pulse: Activity,
  teams: Users,
  portfolio: IdCard,
  website: Globe,
  personal: Bot,
  knowledge: BookOpen,
  documents: FileSearch,
  codebase: GitBranch,
  engineering: Gauge,
} satisfies Record<ProductIcon, LucideIcon>;
