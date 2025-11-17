import { targetStatsType } from "../../types/targetStats";
import { PiCurrencyInrBold } from "react-icons/pi";
import { Progress } from "antd";

interface DataStatsProps {
  dataList: targetStatsType[];
}
const TargetStats: React.FC<DataStatsProps> = ({ dataList }) => {
  return (
    <>
      <div className="flex w-full gap-4 overflow-auto">
        {dataList.map((item, index) => {
          let percentage = 0;
          if (item.salesValue && item.targetSalesValue)
            percentage = (item.salesValue / item.targetSalesValue) * 100;
          percentage = Number(percentage.toFixed(2));

          return (
            <div
              key={index}
              className="flex w-full flex-col gap-1 min-w-[284px] overflow-auto rounded-[10px] bg-white p-4 py-2 sm:p-6 shadow-1 dark:bg-gray-dark"
            >
              <div className="flex w-full items-center gap-2 ">
                <div
                  className="flex h-[20px] w-[22px] items-center justify-center rounded-full text-sm text-white"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <h4 className="text-heading-6 font-bold font-medium text-dark dark:text-white">
                  {item.title}
                </h4>
              </div>

              <div
                className={`flex items-center ${item.positiveSentiment ? "text-green" : "text-red"}`}
              >
                {/* <PiCurrencyInrBold />{" "} */}
                <span>{`${item.value} ( ${item.salesValue} )`} </span>
              </div>

              {item.positiveSentiment ? (
                <Progress
                  percent={percentage}
                  showInfo={true}
                  status="active"
                  strokeColor={
                    percentage < 45
                      ? {
                          "0%": "#1201bd",
                          "25%": "#ff1f00",
                        }
                      : {
                          "0%": "#108ee9",
                          "100%": "#87d068",
                        }
                  }
                  className="!text-white"
                />
              ) : (
                <Progress
                  percent={percentage}
                  showInfo={true}
                  status="active"
                  strokeColor={
                    percentage > 45
                      ? {
                          "0%": "#1201bd",
                          "100%": "#ff1f00",
                        }
                      : {
                          "0%": "#108ee9",
                          "25%": "#87d068",
                        }
                  }
                  className="!text-white"
                />
              )}
            </div>
          );
        })}
      </div>
      <style>{`
      .dark .ant-progress .ant-progress-text{
      color: white !important;
      }
      `}</style>
    </>
  );
};

export default TargetStats;
