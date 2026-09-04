import type { LucideIcon } from 'lucide-react';
import {
  Kanban,
  LayoutGrid,
  CalendarCheck,
  Users,
  Boxes,
  Building2,
  Wrench,
  Truck,
  Wallet,
  Globe,
  BarChart3,
} from 'lucide-react';

export type ViewMode =
  | 'pipeline'
  | 'board'
  | 'follow_ups'
  | 'floor'
  | 'inventory'
  | 'fi_desk'
  | 'service_drive'
  | 'delivery'
  | 'commissions'
  | 'social_intake'
  | 'analytics';

export interface NavItem {
  id: ViewMode;
  label: string;
  icon: LucideIcon;
  badgeKey?: 'overdue';
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Showroom & Sales',
    items: [
      { id: 'pipeline', label: 'Pipeline', icon: Kanban },
      { id: 'board', label: 'Kanban Board', icon: LayoutGrid },
      { id: 'follow_ups', label: 'Follow-ups', icon: CalendarCheck, badgeKey: 'overdue' },
      { id: 'floor', label: 'Floor Board', icon: Users },
      { id: 'social_intake', label: 'Social Hub', icon: Globe },
    ],
  },
  {
    title: 'Deal Desking & Lot',
    items: [
      { id: 'inventory', label: 'Stock Matrix', icon: Boxes },
      { id: 'fi_desk', label: 'F&I Desk', icon: Building2 },
      { id: 'service_drive', label: 'Service Drive', icon: Wrench },
      { id: 'delivery', label: 'Delivery Bay', icon: Truck },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'commissions', label: 'Commissions', icon: Wallet },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
];
