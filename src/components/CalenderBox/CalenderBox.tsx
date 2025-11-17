import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Badge, Popover, Spin } from "antd";
import type { Dayjs } from "dayjs";
import type { BadgeProps } from "antd";
import dayjs from "dayjs";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import { FiClock, FiUser, FiUserCheck, FiMessageCircle } from "react-icons/fi";
import { MdOutlineSupportAgent } from "react-icons/md";
import { Link } from "react-router-dom";
import Heading from "../CommonUI/Heading";

interface CalendarEvent {
  type: BadgeProps["status"];
  content: string;
  details?: {
    id: string;
    firstName: string;
    assignedAgent: {
      _id: string;
      name: string;
    };
    followUpDate: string;
    comment: string;
  };
}

interface CalendarData {
  _id: string;
  firstName: string;
  assignedAgent: {
    _id: string;
    name: string;
  };
  followUpDate: string;
  comment: string;
  id: string;
}

const EventModal = ({ listData }: { listData: CalendarEvent[] }) => (
  <div className="max-w-sm divide-y divide-gray-200 dark:divide-gray-700">
    {listData.map((item, index) => (
      <div key={index} className="py-3 first:pt-0 last:pb-0">
        <Link to={`/leads/${item.details?.id}`}>
          <div className="flex items-center gap-2 mb-2">
            <Badge status={item.type} />
            <span className="font-medium text-base dark:text-white">
              {item.content}
            </span>
          </div>
          {item.details && (
            <div className="space-y-2 ml-1">
              <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                <FiUser className="text-primary" size={16} />
                <span>{item?.details?.firstName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                <MdOutlineSupportAgent className="text-primary" size={16} />
                <span>{item?.details?.assignedAgent?.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                <FiMessageCircle className="text-primary" size={16} />
                <span>{item?.details?.comment}</span>
              </div>
              <div className="flex items-center gap-2 text-sm dark:text-gray-300">
                <FiClock className="text-primary" size={16} />
                <span>{dayjs(item?.details?.followUpDate)?.format("HH:mm")}</span>
              </div>
            </div>
          )}
        </Link>
      </div>
    ))}
  </div>
);

const CalendarBox = ({ widgetModeOn = false }: any) => {
  const [value, setValue] = useState(() => dayjs());
  const [selectedValue, setSelectedValue] = useState(() => dayjs());
  const [calendarData, setCalendarData] = useState<CalendarData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCalendarData = async () => {
    try {
      setIsLoading(true);
      const { data: response, error } = await API.getAuthAPI(
        END_POINT.CALENDAR,
        true
      );

      if (error) return;

      if (response) {
        setCalendarData(response);
      }
    } catch (error: any) {
      console.error(error.message || "Failed to fetch calendar data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Transform calendar data into a map of dates to events
  const eventsByDate = useMemo(() => {
    const events = new Map<string, CalendarEvent[]>();

    calendarData.forEach((event) => {
      const date = dayjs(event.followUpDate).format("YYYY-MM-DD");

      if (!events.has(date)) {
        events.set(date, []);
      }

      events.get(date)?.push({
        type: "processing",
        content: `${event.comment}`,
        // content: `Follow-up with ${event.firstName}`,
        details: event,
      });
    });

    return events;
  }, [calendarData]);

  const getListData = (value: Dayjs): CalendarEvent[] => {
    const dateStr = value.format("YYYY-MM-DD");
    return eventsByDate.get(dateStr) || [];
  };

  const onSelect = (newValue: Dayjs) => {
    setValue(newValue);
    setSelectedValue(newValue);
  };

  const onPanelChange = (newValue: Dayjs) => {
    setValue(newValue);
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    if (listData.length === 0) return null;

    return (
      <Popover
        content={<EventModal listData={listData} />}
        title={
          <div className="font-medium text-lg pb-2 border-b dark:border-gray-700 dark:text-white">
            Follow-up Details
          </div>
        }
        trigger={["hover"]}
        placement="right"
        overlayClassName="calendar-popover"
      >
        <ul className="events">
          {listData.map((item, index) => (
            <li
              key={index}
              className="overflow-hidden text-ellipsis whitespace-nowrap"
            >
              <Badge status={item.type} text={item.content} />
            </li>
          ))}
        </ul>
      </Popover>
    );
  };

  // const dateCellRender = (value: Dayjs) => {
  //   const listData = getListData(value);
  //   if (listData.length === 0) return null;

  //   return (
  //     <Popover
  //       content={<EventModal listData={listData} />}
  //       title={
  //         <div className="font-medium text-lg pb-2 border-b dark:border-gray-700 dark:text-white">
  //           Follow-up Details
  //         </div>
  //       }
  //       trigger={["hover"]}
  //       placement="right"
  //       overlayClassName="calendar-popover"
  //     >
  //       <ul className="events">
  //         {listData.map((item, index) => (
  //           <li
  //             key={index}
  //             className="calendar-event-item flex items-center gap-1 px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  //           >
  //             <Badge status={item.type} />
  //             <span className="text-xs truncate dark:text-gray-300">
  //               {item.content}
  //             </span>
  //           </li>
  //         ))}
  //       </ul>
  //     </Popover>
  //   );
  // };

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center bg-white dark:bg-gray-800 rounded-lg">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="custom-calendar-wrapper bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {widgetModeOn ? (
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white mb-2">
            Follow Up Calender
          </h4>
        ) : (
          <Heading title="Follow Up Calender" />
        )}
        <Calendar
          value={value}
          onSelect={onSelect}
          onPanelChange={onPanelChange}
          cellRender={(current, info) => {
            if (info.type === "date") return dateCellRender(current);
            return info.originNode;
          }}
        />
        <style>{`
        .dark .ant-picker-calendar.ant-picker-calendar-full .ant-picker-panel {
          background: #122031 !important;
        }

        .dark
          .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-in-view.ant-picker-cell-selected
          .ant-picker-calendar-date,
        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-in-view.ant-picker-cell-selected
          .ant-picker-calendar-date-today {
          background-color: #374151;
        }

        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-in-view.ant-picker-cell-selected
          .ant-picker-calendar-date,
        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-in-view.ant-picker-cell-selected
          .ant-picker-calendar-date-today {
          background-color: #e6f4ff;
        }

        .ant-picker-calendar {
          background: transparent !important;
        }

        .ant-picker-calendar .ant-picker-content th {
          color: white;
          text-align: center;
        }

        .ant-picker-calendar .ant-picker-content thead {
          background: #5750f1;
          font-size: 18px;
          font-weight: 800;
          font-family: "Satoshi";
          height: 41px;
        }

        .dark .ant-picker-calendar .ant-picker-cell {
          color: rgb(156 163 175);
        }

        .dark .ant-picker-calendar .ant-picker-cell-in-view {
          color: white;
        }

        .dark
          .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-calendar-date {
          border-color: white;
        }

        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-selected
          .ant-picker-calendar-date
          .ant-picker-calendar-date-value,
        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-selected:hover
          .ant-picker-calendar-date
          .ant-picker-calendar-date-value,
        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-selected
          .ant-picker-calendar-date-today
          .ant-picker-calendar-date-value,
        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-selected:hover
          .ant-picker-calendar-date-today
          .ant-picker-calendar-date-value {
          font-size: 24px;
        }

        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-selected
          .ant-picker-calendar-date
          .ant-picker-calendar-date-value,
        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-selected:hover
          .ant-picker-calendar-date
          .ant-picker-calendar-date-value,
        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-selected
          .ant-picker-calendar-date-today
          .ant-picker-calendar-date-value,
        .ant-picker-calendar.ant-picker-calendar-full
          .ant-picker-cell-selected:hover
          .ant-picker-calendar-date-today
          .ant-picker-calendar-date-value {
          color: #3183f6;
          font-size: 26px;
          font-weight: 600;
        }

        .ant-picker-calendar .ant-picker-calendar-header {
          border-radius: 8px;
          background: #5750f1;
          padding: 12px 12px;
        }

        /* Add styles for events */
        .events {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .events .ant-badge-status {
          width: 100%;
          overflow: hidden;
          font-size: 12px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .events .ant-badge-status-dot {
          display: inline-block;
          margin-right: 4px;
        }

        .events .ant-badge-status-text {
          color: rgba(0, 0, 0, 0.88);
        }

        .dark .events .ant-badge-status-text {
          color: rgba(255, 255, 255, 0.88);
        }

        .ant-picker-calendar-full
          .ant-picker-panel
          .ant-picker-calendar-date-content {
          height: 60px;
          overflow: hidden;
        }

        .dark .ant-popover .ant-popover-inner {
          background: black !important;
          box-shadow:
            0 6px 16px 0 rgb(255 255 255 / 8%),
            0 3px 6px -4px rgb(255 243 243 / 12%),
            0 9px 28px 8px rgb(255 255 255 / 5%);
        }

        .dark .ant-popover .ant-popover-title {
          color: white !important;
        }

         .calendar-popover .ant-popover-inner {

          border-radius: 12px;

          overflow: hidden;

        }

        .dark .calendar-popover .ant-popover-inner {

          background: #1F2937;

          border: 1px solid #374151;

        }
      `}</style>
      </div>
    </>
  );
};

export default CalendarBox;
