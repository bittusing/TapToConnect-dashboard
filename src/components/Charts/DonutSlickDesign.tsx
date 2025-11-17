import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function DonutSlickDesign({
  chartSeries = 0,
  gradientColors = ["#3C50E0", "#1C3FB7", "#8099EC"],
  gradientStops = [25, 75, 100],
  labels = ["Used Storage"],
  formatter = function (val: number) {
    return val + " GB";
  },
}: any) {
  const chartOptions: ApexOptions = {
    chart: {
      height: 100,
      type: "radialBar",
    },
    plotOptions: {
      radialBar: {
        hollow: {
          margin: 15,
          size: "70%",
        },

        track: {
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            color: "#999",
            opacity: 1,
            blur: 2,
          },
        },

        dataLabels: {
          //   showOn: "always",
          name: {
            offsetY: -4,
            show: true,
            color: "#888",
            fontSize: "13px",
          },
          value: {
            color: "#111",
            fontSize: "21px",
            show: true,
            formatter,
          },
        },
      },
    },

    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        gradientToColors: gradientColors,
        stops: gradientStops,
      },
    },

    stroke: {
      lineCap: "round",
    },
    labels,
  };

  //   const chartOptions: ApexOptions = {
  //     plotOptions: {
  //       radialBar: {
  //         // startAngle: -360,
  //         // endAngle: 0,
  //         hollow: {
  //           margin: 0,
  //           size: '70%',
  //           background: 'transparent',
  //         },
  //
  //       }
  //     },
  //     fill: {
  //       type: 'gradient',
  //       gradient: {
  //         shade: 'dark',
  //         type: 'horizontal',
  //         gradientToColors: ['#3C50E0', '#1C3FB7', '#5475E5', '#8099EC', '#ADBCF2', '#C3CEF6', '#E1E8FF'],
  //         stops: [0, 25, 50, 75, 100]
  //       }
  //     },
  //   };
  return (
    <>
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="radialBar"
        height={200}
      />
      <style>{`
        .apexcharts-datalabel-value {
          fill: #374151 !important;
        }
        .dark .apexcharts-datalabel-value {
          fill: #ffffff !important;
        }
        .dark .apexcharts-track {
          stroke: #374151 !important;
        }
      `}</style>
    </>
  );
}
