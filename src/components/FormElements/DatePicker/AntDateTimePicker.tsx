import React from "react";
import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";
import dayjs from "dayjs";

interface DateTimePickerProps {
  label?: string;
  onChange: (selectedDates: Date[], dateStr: string) => void;
  enableTime?: boolean;
  defaultValue?: string;
  customClassName?: string;
}

const AntDateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  onChange,
  enableTime = false,
  defaultValue,
  customClassName = "",
}) => {
  const handleChange: DatePickerProps["onChange"] = (date, dateString) => {
    if (date) {
      const selectedDate = date.toDate();
      onChange([selectedDate], selectedDate.toISOString());
    } else {
      onChange([], "");
    }
  };

  return (
    <div className={customClassName}>
      {label && (
        <label className="mb-1 block text-body-sm font-medium text-dark dark:text-white">
          {label}
        </label>
      )}
      <DatePicker
        className="w-full h-[50px] rounded-[7px] border-[1.5px] border-stroke bg-transparent px-4 py-2.5 
          outline-none transition focus:border-primary active:border-primary 
          dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:placeholder:text-dark-6"
        showTime={enableTime}
        defaultValue={defaultValue ? dayjs(defaultValue) : undefined}
        format={enableTime ? "DD/MM/YYYY - HH:mm" : "DD/MM/YYYY"}
        onChange={handleChange}
        placement="bottomLeft"
        size="large"
        popupClassName="dark:bg-dark-2 dark:border-dark-3"
      />

      <style>{`
        /* General DatePicker Styles */
        .ant-picker {
          background-color: transparent;
        }
        
        .ant-picker:hover {
          border-color: #5750F1;
        }
        
        .ant-picker-focused {
          border-color: #5750F1;
          box-shadow: 0 0 0 2px rgba(87, 80, 241, 0.2);
        }

        /* Icon Colors */
        .ant-picker-suffix, 
        .ant-picker-clear {
          color: #9CA3AF;
        }

        .dark .ant-picker-suffix,
        .dark .ant-picker-clear {
          color: #6B7280;
        }

        /* Dropdown Panel Dark Mode */
        .dark .ant-picker-dropdown {
          background-color: #1F2937;
        }

        .dark .ant-picker-dropdown .ant-picker-time-panel-column:not(:first-child) {
          border-left: 1px solid #374151;
        }

        .dark .ant-picker-dropdown .ant-picker-panel-container {
          background-color: #1F2937;
          border: 1px solid #374151;
        }

        .dark .ant-picker-cell {
          color: #D1D5DB;
        }

        .dark .ant-picker-cell-in-view {
          color: #F3F4F6;
        }

        .dark .ant-picker-cell:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end):not(.ant-picker-cell-range-hover-start):not(.ant-picker-cell-range-hover-end) .ant-picker-cell-inner {
          background-color: #374151;
        }

        .dark .ant-picker-cell-selected .ant-picker-cell-inner,
        .dark .ant-picker-cell-range-start .ant-picker-cell-inner,
        .dark .ant-picker-cell-range-end .ant-picker-cell-inner {
          background-color: #5750F1;
          color: white;
        }

        .dark .ant-picker-time-panel-column > li.ant-picker-time-panel-cell-selected .ant-picker-time-panel-cell-inner {
          background-color: #374151;
          color: white;
        }

        .dark .ant-picker-header {
          color: #F3F4F6;
          border-bottom: 1px solid #374151;
        }

        .dark .ant-picker-header button {
          color: #D1D5DB;
        }

        .dark .ant-picker-header button:hover {
          color: #F3F4F6;
        }

        .dark .ant-picker-content th {
          color: #9CA3AF;
        }

        .dark .ant-picker-footer,
        .dark .ant-picker-time-panel-column {
          border-top: 1px solid #374151;
        }

        /* Time Panel Dark Mode */
        .dark .ant-picker-time-panel {
          border-left: 1px solid #374151;
        }

        .dark .ant-picker-time-panel-column > li .ant-picker-time-panel-cell-inner {
          color: #D1D5DB;
        }

        .dark .ant-picker-time-panel-column > li .ant-picker-time-panel-cell-inner:hover {
          background-color: #374151;
        }

        /* Input Dark Mode */
        .dark .ant-picker-input > input {
          color: #F3F4F6;
        }

        .dark .ant-picker-input > input::placeholder {
          color: #6B7280;
        }

        /* Mobile Optimization */
        @media (max-width: 640px) {
          .ant-picker-dropdown {
            width: calc(100vw - 32px) !important;
            min-width: auto !important;
          }

          .ant-picker-time-panel {
            width: 100% !important;
          }

          .ant-picker-datetime-panel {
            display: flex;
            flex-direction: column;
          }

          .ant-picker-time-panel {
            border-top: 1px solid #e5e7eb;
            border-left: none !important;
          }

          .dark .ant-picker-time-panel {
            border-top: 1px solid #374151;
          }
        }
      `}</style>
    </div>
  );
};

export default AntDateTimePicker;
