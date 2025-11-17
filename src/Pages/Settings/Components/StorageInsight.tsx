import { useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import AudioPlayer from "../../../components/AudioPlayer/AudioPlayer";
import SelectGroupOne from "../../../components/FormElements/SelectGroup/SelectGroupOne";
import CustomAntdTable from "../../../components/Tables/CustomAntdTable";
import DonutSlickDesign from "../../../components/Charts/DonutSlickDesign";
import ButtonDefault from "../../../components/Buttons/ButtonDefault";
import AntDateTimePicker from "../../../components/FormElements/DatePicker/AntDateTimePicker";

const StorageInsights = () => {
  const data = [
    {
      key: "1",
      sno: 1,
      leadName: "John Doe",
      agentName: "Agent Smith",
      callDuration: "5:30",
      leadSize: "2.3 MB",
      recordingFile: "call_recording_001.mp3",
    },
    {
      key: "2",
      sno: 2,
      leadName: "Jane Smith",
      agentName: "Agent Johnson",
      callDuration: "3:45",
      leadSize: "1.8 MB",
      recordingFile: "call_recording_002.mp3",
    },
  ];

  const columns = [
    {
      title: "S.No",
      dataIndex: "sno",
      key: "sno",
      width: 70,
    },
    {
      title: "Lead Name",
      dataIndex: "leadName",
      key: "leadName",
    },
    {
      title: "Agent Name",
      dataIndex: "agentName",
      key: "agentName",
    },
    {
      title: "Call Duration",
      dataIndex: "callDuration",
      key: "callDuration",
    },
    {
      title: "Lead Size",
      dataIndex: "leadSize",
      key: "leadSize",
    },
    {
      title: "Recording File",
      dataIndex: "recordingFile",
      key: "recordingFile",
      render: (recordingFile: string) => (
        <div className="flex items-center gap-3">
          <AudioPlayer audioFile={recordingFile} />
          <button className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700">
            <DownloadOutlined className="text-xl text-primary" />
          </button>
        </div>
      ),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: () => (
    //     <div className="flex space-x-2 text-lg">
    //       {/* <button className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700">
    //         <DeleteFilled className="text-red" />
    //       </button>
    //       <button className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700">
    //         <MoreOutlined className="text-gray-500" />
    //       </button> */}
    //     </div>
    //   ),
    // },
  ];

  // Calculate percentage for the circular progress
  const usedStorage = 1.98;
  const totalStorage = 5;
  const availableStorage = 3.12;
  const percentage = Number(((usedStorage / totalStorage) * 100).toFixed(2));
  const chartSeries: number[] = [percentage];

  const [employee, setEmployee] = useState("Admin");
  const [fromDate, setFromDate] = useState("01/05/2024");
  const [toDate, setToDate] = useState("17/10/2024");

  const handleEmployeeChange = (value: string) => {
    setEmployee(value);
  };

  const handleFromDateChange = (selectedDates: Date[], dateStr: string) => {
    setFromDate(dateStr);
  };

  const handleToDateChange = (selectedDates: Date[], dateStr: string) => {
    setToDate(dateStr);
  };

  const handleApply = () => {
    console.log("Applying filters:", { employee, fromDate, toDate });
    // Implement filter logic here
  };

  return (
    <div className="mx-auto">
      {/* <Heading title="Manage Storage" alignCenter /> */}
      <div className="-mt-6 mb-3 flex flex-col items-center gap-3 sm:flex-row sm:gap-0">
        {/* Storage Graph and Button Container */}
        <div className="flex w-full flex-col items-center justify-center">
          <DonutSlickDesign
            chartSeries={chartSeries}
            formatter={function () {
              return usedStorage + " GB";
            }}
          />
          {/* Storage Details */}
          <div className="flex justify-center gap-12">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Available Space
              </div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white">
                {availableStorage} GB
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Space
              </div>
              <div className="text-xl font-semibold text-gray-800 dark:text-white">
                {totalStorage} GB
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 justify-end">
          <ButtonDefault label=" Get More Storage" customClasses="w-max" />
        </div>
      </div>

      <hr />

      <div className="my-3 flex flex-wrap items-end justify-center gap-4">
        <div className="w-full lg:w-1/4">
          <SelectGroupOne
            label="Select Employee"
            options={[{ value: "Admin", label: "Admin" }]}
            setSelectedOption={handleEmployeeChange}
          />
        </div>
        <div className="w-full lg:w-1/4">
          <AntDateTimePicker
            label="From Date"
            onChange={handleFromDateChange}
          />
        </div>
        <div className="w-full lg:w-1/4">
          <AntDateTimePicker label="To Date" onChange={handleToDateChange} />
        </div>
        <ButtonDefault
          label="Apply"
          onClick={handleApply}
          customClasses="min-w-[130px]"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <CustomAntdTable
          columns={columns}
          dataSource={data}
          pagination={{
            pageSize: 10,
            total: data.length,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </div>
    </div>
  );
};

export default StorageInsights;
