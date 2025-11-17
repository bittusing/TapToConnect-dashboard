import { ReactNode } from "react";

export type dataStats = {
  icon?: string | ReactNode;
  color?: string;
  title?: string;
  value?: string;
  growthRate?: number;
  percent?: number;
  webroute?: string;
};
