import { ApexOptions } from "apexcharts";
import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

interface LeadSource {
  name: string;
  value: number;
  color: string;
  percentage: string;
}

interface LeadSourceOverview {
  total: number;
  sources: LeadSource[];
}

interface DonutChartsProps {
  leadSourceMetrics: LeadSourceOverview | null;
}

const generateColors = (count: number): string[] => {
  const baseColor = [37, 28, 255]; // #5750F1 in RGB
  const maxColor = [180, 180, 255]; // Limit the lightest color to avoid white
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const factor = i / (count - 1);
    const r = Math.round(baseColor[0] + (maxColor[0] - baseColor[0]) * factor);
    const g = Math.round(baseColor[1] + (maxColor[1] - baseColor[1]) * factor);
    const b = Math.round(baseColor[2] + (maxColor[2] - baseColor[2]) * factor);
    colors.push(`rgb(${r},${g},${b})`);
  }
  return colors;
};

const DonutCharts: React.FC<DonutChartsProps> = ({ leadSourceMetrics }) => {
  const series = leadSourceMetrics?.sources.map((item) => item.value) || [];
  const labels = leadSourceMetrics?.sources.map((item) => item.name) || [];
  const colors = useMemo(() => 
    generateColors(leadSourceMetrics?.sources.length || 0), 
    [leadSourceMetrics?.sources.length]
  );

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: colors,
    labels: labels,
    legend: {
      show: false,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Total Courses",
              fontSize: "16px",
              fontWeight: "400",
              formatter: function () {
                return leadSourceMetrics?.total.toString() || "0";
              },
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 415,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 300,
          },
        },
      },
    ],
  };

  const sectionHeading=()=>(<div>
  <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
    Leads Source Overview
  </h4>
</div>)

  if (!leadSourceMetrics || leadSourceMetrics.sources.length === 0) {
    return (
      <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-7 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5">
        {sectionHeading()}
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">No lead source data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-7 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5">
      <div className="mb-9 justify-between gap-4 sm:flex">
       {sectionHeading()}
      </div>
      <div className="mb-8">
        {series?.length>1?<div className="mx-auto flex justify-center">
          <ReactApexChart 
            options={options} 
            series={series} 
            type="donut" 
          />
        </div>:
        <h1 className="text-center">Chart will be visible when more than 1 lead source are available</h1>}
      </div>
      <div className="mx-auto w-full">
        <div className="-mx-7.5 flex flex-wrap items-center gap-y-2.5">
          {leadSourceMetrics.sources.map((item, index) => (
            <div key={item.name} className="w-full px-7.5 sm:w-1/2">
              <div className="flex w-full items-center">
                <span
                  className="mr-2 block h-3 w-full max-w-3 rounded-full"
                  style={{ backgroundColor: colors[index] }}
                ></span>
                <p className="flex w-full justify-between text-body-sm font-medium text-dark dark:text-dark-6">
                  <span>{item.name}</span>
                  <span>{item.value} ({item.percentage}%)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutCharts;