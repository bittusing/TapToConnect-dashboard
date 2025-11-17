import { useMemo } from "react";
import CustomAntdTable from "../../../components/Tables/CustomAntdTable";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import useScreenHook from "../../../hooks/useScreenHook";
import { Spin } from "antd";

interface SummaryProps {
  data?: {
    callType: Array<{
      calltype: string;
      calls: number;
      duration: string;
    }>;
    stats: {
      missCall: number;
      notConnectedCall: number;
      connectedCalls: number;
      rejected: number;
      workingHours: string;
    };
  };
  isLoading?: boolean;
}

export default function Summary({ data, isLoading }: SummaryProps) {
  const { deviceType } = useScreenHook();

  const summaryColumns = [
    {
      title: "Call Type",
      dataIndex: "callType",
      key: "callType",
      render: (text: string) => (
        <span style={{ color: returnColorCode(text) }}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
      ),
    },
    { title: "Calls", dataIndex: "calls", key: "calls" },
    { title: "Duration", dataIndex: "duration", key: "duration" },
  ];

  const summaryData = useMemo(() => {
    if (!data?.callType) return [];
    return data.callType.map((item, index) => ({
      key: index.toString(),
      callType: item.calltype,
      calls: item.calls,
      duration: item.duration,
    }));
  }, [data]);

  const statsData = useMemo(() => {
    if (!data?.stats) return [];
    return [
      { type: "Miss Call", count: data.stats.missCall },
      { type: "Not Connected Call", count: data.stats.notConnectedCall },
      { type: "Connected Calls", count: data.stats.connectedCalls },
      { type: "Rejected", count: data.stats.rejected },
      { type: "Working Hours", count: data.stats.workingHours },
    ];
  }, [data]);

  const chartData = useMemo(() => {
    if (!data?.callType) return { series: [], labels: [] };
    const filtered = data.callType.filter((item) => item.calltype !== "total");
    return {
      series: filtered.map((item) => item.calls),
      labels: filtered.map(
        (item) =>
          `${
            item.calltype.charAt(0).toUpperCase() + item.calltype.slice(1)
          } Call`
      ),
    };
  }, [data]);

  const donutChartOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: chartData.labels,
    colors: ["#10b981", "#3b82f6", "#fbbf24", "#ec4899", "#e74acb"],
    legend: {
      position: "right",
      fontSize: deviceType === "mobile" ? "7px" : "14px",
      fontFamily: "Helvetica, Arial, sans-serif",
      fontWeight: 400,
      itemMargin: { horizontal: 5, vertical: 2 },
    },
    plotOptions: {
      pie: {
        donut: { size: "65%" },
      },
    },
    dataLabels: {
      enabled: true,
      // distributed:true,
      style: {
        // fontSize: "14px",
        // fontFamily?: string
        // fontWeight?: string | number
        // colors: ["#ffffff","#ffffff","#ffffff","#ffffff","#ffffff"],
      },
      formatter: (val: number) => val.toFixed(0) + "%",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: "100%" },
        },
      },
    ],
  };

  const returnColorCode = (type: string): string => {
    const colors: {
      [key in
        | "incoming"
        | "outgoing"
        | "missed"
        | "rejected"
        | "unknown"]: string;
    } = {
      incoming: "#10b981",
      outgoing: "#3b82f6",
      missed: "#fbbf24",
      rejected: "#ec4899",
      unknown: "#e74acb",
    };

    return colors[type.toLowerCase() as keyof typeof colors] || "#000000";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 lg:flex-row lg:gap-0">
      <div className="w-full max-w-[560px] pr-4">
        <CustomAntdTable
          columns={summaryColumns}
          dataSource={summaryData}
          pagination={false}
        />
      </div>
      <div className="flex w-full min-w-[167px] flex-wrap gap-3 lg:w-auto">
        {statsData.map((item) => (
          <div
            key={item.type}
            className="flex w-full max-w-[159px] flex-col justify-center bg-gray-100 p-2 px-4 dark:bg-gray-7 sm:max-w-[200px]"
          >
            <span className="text-gray-6 dark:text-gray-5">{item.type}</span>
            <span className="font-semibold text-dark dark:text-white">
              {item.count}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full">
        {parseInt(data?.stats?.workingHours || "0") ? (
          <ReactApexChart
            options={donutChartOptions}
            series={chartData.series}
            type="donut"
            height={350}
          />
        ) : null}
      </div>
    </div>
  );
}
