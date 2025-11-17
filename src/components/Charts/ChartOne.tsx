import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { useEffect, useState } from "react";

interface PaymentOverview {
  chartData: Array<{
    month: string;
    received: number;
    loss: number;
    receivedAmount: number;
    lossAmount: number;
  }>;
  summary: {
    receivedLeads: number;
    lostLeads: number;
  };
}

interface ChartOneProps {
  paymentOverview: PaymentOverview | null;
}

const ChartOne: React.FC<ChartOneProps> = ({ paymentOverview }) => {
  // Track dark mode
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode
    setIsDark(document.documentElement.classList.contains("dark"));

    // Create observer to watch for dark mode changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDark(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const series = [
    {
      name: "Won Amount",
      data: paymentOverview?.chartData.map((item) => item.receivedAmount) || [],
    },
    {
      name: "Lost Amount",
      data: paymentOverview?.chartData.map((item) => item.lossAmount) || [],
    },
  ];

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: isDark ? "#fff" : undefined,
      },
    },
    colors: ["#5750F1", "#0ABEF9"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      background: "transparent",
      foreColor: isDark ? "#A0AEC0" : "#4A5568", // Text color for axes and labels
    },
    fill: {
      gradient: {
        opacityFrom: isDark ? 0.35 : 0.55,
        opacityTo: 0.05,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
    stroke: {
      curve: "smooth",
      width: 2,
    },
    markers: {
      size: 0,
      colors: isDark ? ["#fff"] : undefined,
      strokeColors: "#fff",
    },
    grid: {
      strokeDashArray: 5,
      borderColor: isDark ? "#2D3748" : "#E2E8F0",
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      fixed: {
        enabled: false,
      },
      x: {
        show: false,
      },
      y: {
        formatter: function (value) {
          return `₹${value.toLocaleString()}`;
        },
      },
      marker: {
        show: false,
      },
    },
    xaxis: {
      type: "category",
      categories: paymentOverview?.chartData.map((item) => item.month) || [],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: isDark ? "#A0AEC0" : "#4A5568",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#A0AEC0" : "#4A5568",
          fontSize: "12px",
        },
        formatter: function (value) {
          return `₹${value.toLocaleString()}`;
        },
      },
    },
  };

  return (
    <div
      className={
        "col-span-12 rounded-sm bg-white px-5 pt-7.5 pb-5 shadow-default dark:bg-gray-dark sm:px-7.5 xl:col-span-7"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <h4 className="text-xl font-bold text-black dark:text-white">
              Won - Loss Overview
            </h4>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={350}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-3.5 sm:flex-nowrap sm:gap-5">
        <div className="flex w-full flex-wrap items-center gap-3.5 sm:gap-5">
          <div className="w-full px-8">
            <div className="flex w-full items-center justify-center gap-3.5">
              <div className="w-full max-w-52">
                <div className="flex w-full items-center justify-between border-b border-stroke pb-2.5 dark:border-stroke dark">
                  <div className="flex items-center gap-1.5">
                    <span className="block h-3 w-3 rounded-full bg-primary"></span>
                    <span className="font-medium w-fit " style={{color: isDark?"white":"black"}}>
                      Won Amount
                    </span>
                  </div>
                  <span className="font-medium text-gray-6 ">
                    ₹
                    {paymentOverview?.summary.receivedLeads.toLocaleString() ||
                      "0"}
                  </span>
                </div>
              </div>
              <div className="w-full max-w-45">
                <div className="flex w-full items-center justify-between border-b border-stroke pb-2.5 dark:border-strokedark">
                  <div className="flex items-center gap-1.5">
                    <span className="block h-3 w-3 rounded-full  bg-red"></span>
                    <span className="font-medium text-black dark:text-white">
                      Lost Amount
                    </span>
                  </div>
                  <span className="font-medium text-gray-6  ml-3">
                    ₹
                    {paymentOverview?.summary.lostLeads.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
