import { ReactNode } from "react";

export interface SidebarChildItem {
  label: string;
  route: string;
  pro?: boolean;
}

export interface MenuItem {
  icon: ReactNode;
  label: string;
  route: string;
  children?: SidebarChildItem[];
  message?: string;
  pro?: boolean;
}

export interface MenuGroup {
  name: string;
  menuItems: MenuItem[];
}




