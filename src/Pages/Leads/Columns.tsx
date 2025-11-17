// columns.ts - Create this as a separate file
import { Button, Tooltip } from "antd";
import CheckboxTwo from "../../components/FormElements/Checkboxes/CheckboxTwo";
import { Link } from "react-router-dom";
import { EditFilled } from "@ant-design/icons";
import {
  isWithinNext24Hours,
  isPast24Hours,
} from "../../utils/useFullFunctions";

export const DEFAULT_VISIBLE_COLUMNS = [
  "checkbox",
  "name",
  "number",
  "comment",
  "followUpDate",
  "agent",
  "status",
  "action",
];

// const getRowClassName = (record: any): string => {
//   const followUpDate = new Date(record.followUpDate);

//   if (isWithinNext24Hours(followUpDate)) {
//     return "upcoming-followup pulse-green";
//   }
//   if (isPast24Hours(followUpDate)) {
//     return "missed-followup pulse-red";
//   }
//   return "";
// };

export const getTableColumns = (
  handleSelectAll: ({ isChecked }: { isChecked: boolean }) => void,
  areAllVisibleRowsSelected: () => boolean,
  rowSelection: ({
    value,
    isChecked,
  }: {
    value: string;
    isChecked: boolean;
  }) => void,
  selectedRowKeys: string[],
  setSelectedLead: (lead: any) => void,
  setIsQuickEditOpen: (open: boolean) => void
) => [
  {
    title: (
      <div>
        <CheckboxTwo
          id="selectAllLeads"
          onChange={handleSelectAll}
          checked={areAllVisibleRowsSelected()}
        />
      </div>
    ),
    dataIndex: "key",
    key: "checkbox",
    render: (key: string) => (
      <div onClick={(e) => e.stopPropagation()}>
        <CheckboxTwo
          id={key}
          onChange={({ value: checkboxValue, isChecked }) =>
            rowSelection({ value: checkboxValue, isChecked })
          }
          checked={selectedRowKeys.includes(key)}
        />
      </div>
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Contact",
    dataIndex: "number",
    key: "number",
  },
  {
    title: "Comment",
    dataIndex: "comment",
    key: "comment",
    minWidth: 123,
    render: (record: any) =>
      record?.length ? (
        <span>
          {record.length > 75 ? (
            <Tooltip title={record}>{`${record.slice(0, 75)}...`}</Tooltip>
          ) : (
            record
          )}
        </span>
      ) : null,
  },
  {
    title: "Follow-Up Date",
    dataIndex: "followUpDate",
    key: "followUpDate",
    minWidth: 143,
    render: (date: Date) => {
      const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      const formattedDate = date.toLocaleDateString("en-GB", options);
      const formattedTime = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDateTime = `${formattedDate} - ${formattedTime}`;
      // const formattedDate = date.toLocaleString();
      const isUpcoming = isWithinNext24Hours(date);
      const isMissed = isPast24Hours(date);

      return (
        <div className="flex items-center gap-2">
          <span>{formattedDateTime}</span>
          {/* {isUpcoming && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
              Due Soon
            </span>
          )} */}
          {isMissed && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 border border-red-200">
              Overdue
            </span>
          )}
        </div>
      );
    },
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    minWidth: 103,
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
    minWidth: 123,
    render: (record: any) =>
      record?.length ? (
        <span>
          {record.length > 75 ? (
            <Tooltip title={record}>{`${record.slice(0, 75)}...`}</Tooltip>
          ) : (
            record
          )}
        </span>
      ) : null,
  },
  {
    title: "Product and Service",
    dataIndex: "service",
    key: "service",
    minWidth: 100,
  },
  {
    title: "Agent",
    dataIndex: "agent",
    key: "agent",
    minWidth: 123,
  },
  {
    title: "Lead Source",
    dataIndex: "leadSource",
    key: "leadSource",
    minWidth: 123,
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
  },
  {
    title: "Created Date",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: "Edited At",
    dataIndex: "updatedAt",
    key: "updatedAt",
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: "Alternate Contact",
    dataIndex: "alternatePhone",
    key: "alternatePhone",
  },
  {
    title: "Pin Code",
    dataIndex: "pinCode",
    key: "pinCode",
  },
  {
    title: "State",
    dataIndex: "state",
    key: "state",
  },
  {
    title: "Country",
    dataIndex: "country",
    key: "country",
  },

  {
    title: "Lead Cost",
    dataIndex: "leadCost",
    key: "leadCost",
    render: (cost: number) => `₹ ${cost.toFixed(2)}`,
  },
  {
    title: "Company",
    dataIndex: "companyName",
    key: "companyName",
  },
  {
    title: "Address",
    dataIndex: "fullAddress",
    key: "fullAddress",
    render: (record: any) =>
      record?.length ? (
        <span>
          {record.length > 56 ? (
            <Tooltip title={record}>{`${record.slice(0, 56)}...`}</Tooltip>
          ) : (
            record
          )}
        </span>
      ) : null,
  },
  {
    title: "City",
    dataIndex: "city",
    key: "city",
  },
  {
    title: "Website",
    dataIndex: "website",
    key: "website",
  },
  {
    title: "Won Amount",
    dataIndex: "leadWonAmount",
    key: "leadWonAmount",
    render: (cost: number) => `₹ ${cost.toFixed(2)}`,
  },
  {
    title: "Lead Add Type",
    dataIndex: "leadAddType",
    key: "leadAddType",
  },
  {
    title: "Action",
    key: "action",
    render: (record: any) => (
      <div className="flex space-x-2">
        <Link to={`/leads/${record.key}`}>
          <Button
            icon={<EditFilled />}
            className="bg-transparent text-primary dark:text-blue-400"
          />
        </Link>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLead(record);
            setIsQuickEditOpen(true);
          }}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Quick Edit
        </Button>
        {record?.statusData?.name && (
          <Tooltip title={`Stands for : ${record?.statusData?.name}`}>
            <Button
              icon={record?.statusData?.name[0]}
              className={`text-sm font-semibold text-white`}
              style={{
                background: record?.statusData?.color
                  ? record?.statusData?.color
                  : "green",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLead(record);
                setIsQuickEditOpen(true);
              }}
            />
          </Tooltip>
        )}
      </div>
    ),
  },
];
