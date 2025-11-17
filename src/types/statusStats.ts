import { ReactNode } from "react";

export type statusStatsType = {
  icon?: string | ReactNode;
  color?: string;
  title?: string;
  value?: string | number;
  nextValue?: string | number;
  growthRate?: number;
  percent?: number;
  webroute?: string;
  statusId?: string;
};
