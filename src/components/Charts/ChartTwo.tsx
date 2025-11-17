import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface PaymentOverview {
  chartData: Array<{
    month: string;
    received: number;
    loss: number;
    receivedAmount: number;
    lossAmount: number;
  }>;
}

interface ChartTwoProps {
  paymentOverview: PaymentOverview | null;
}

const ChartTwo: React.FC<ChartTwoProps> = ({ paymentOverview }) => {
  const series = [
    {
      name: "Won Deals",
      data: paymentOverview?.chartData.map((item) => item.received) || [],
    },
    {
      name: "Lost Deals",
      data: paymentOverview?.chartData.map((item) => item.loss) || [],
    },
  ];

  const options: ApexOptions = {
    colors: ["#5750F1", "#0ABEF9"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 3,
              columnWidth: "25%",
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 3,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      strokeDashArray: 5,
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
    xaxis: {
      categories: paymentOverview?.chartData.map((item) => item.month) || [],
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        radius: 99,
        width: 16,
        height: 16,
        strokeWidth: 10,
        strokeColor: "transparent",
      },
    },
    fill: {
      opacity: 1,
    },
  };

  const totalWonDeals =
    paymentOverview?.chartData.reduce((sum, item) => sum + item.received, 0) ||
    0;
  const totalLostDeals =
    paymentOverview?.chartData.reduce((sum, item) => sum + item.loss, 0) || 0;

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Deal Analytics
          </h4>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-md border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
          <h4 className="mb-1.5 text-title-sm font-medium text-black ">
            Won Deals
          </h4>
          <h3 className="text-title-lg font-bold text-success">
            {totalWonDeals}
          </h3>
        </div>
        <div className="rounded-md border border-stroke bg-gray p-4 dark:border-strokedark dark:bg-meta-4">
          <h4 className="mb-1.5 text-title-sm font-medium text-black ">
            Lost Deals
          </h4>
          <h3 className="text-title-lg font-bold text-danger">
            {totalLostDeals}
          </h3>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-ml-3.5">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={370}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;
