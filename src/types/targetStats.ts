import { ReactNode } from "react";

export type targetStatsType = {
  icon?: string | ReactNode;
  color?: string;
  title?: string;
  value?: string;
  salesValue?: number;
  growthRate?: number;
  positiveSentiment?: boolean;
  targetSalesValue?: number;
};
