import { dataStats } from "../../types/dataStats";
import GrowthIconGreen from "../Assets/Icons/DashBoardIcons/GrowthIconGreen";
import FallIconRed from "../Assets/Icons/DashBoardIcons/FallIconRed";
import { Link } from "react-router-dom";

interface DataStatsProps {
  dataList: dataStats[];
}
const DataStatsOne: React.FC<DataStatsProps> = ({ dataList }) => {
  return (
    <>
      <div className="flex w-full gap-4 overflow-auto">
        {dataList.map((item, index) => (
          <Link
            key={item?.title || "DataStatsOne" + index}
            to={item.webroute?.split(".in")[1] || ""}
            className="min-w-[268px] w-full"
          >
            <div
              className="flex w-full  items-center gap-4 rounded-[10px] bg-white p-4 py-1 shadow-1 dark:bg-gray-dark sm:block sm:gap-0 sm:p-6"
            >
              <div
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-2xl text-white sm:max-h-14.5 sm:min-h-14.5 sm:min-w-14.5 sm:max-w-14.5"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>

              <div className="mt-0 flex items-end justify-between gap-2 sm:mt-6 sm:gap-0">
                <div>
                  <h4 className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
                    {item.value}
                  </h4>
                  <span className="text-body-sm font-medium">{item.title}</span>
                </div>

                <span
                  className={`flex items-center gap-1.5 text-body-sm font-medium ${
                    item.growthRate && item.growthRate > 0
                      ? "text-green"
                      : "text-red"
                  }`}
                >
                  {item.growthRate ? `${item.growthRate}%` : null}
                  {item.growthRate && item.growthRate > 0 ? (
                    <GrowthIconGreen />
                  ) : item.growthRate && item.growthRate <= 0 ? (
                    <FallIconRed />
                  ) : null}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default DataStatsOne;
