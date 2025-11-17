import { useState, useEffect } from "react";
import { SettingOutlined } from "@ant-design/icons";
import ButtonDefault from "../Buttons/ButtonDefault";

const ColumnSelector = ({
  allColumns,
  selectedColumns,
  onColumnChange,
  disabled = false,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  // List of columns that cannot be disabled
  const requiredColumns = ["checkbox", "action"];

  const handleColumnToggle = (columnKey: any) => {
    if (requiredColumns.includes(columnKey)) return;

    const newSelectedColumns = selectedColumns.includes(columnKey)
      ? selectedColumns.filter((key: any) => key !== columnKey)
      : [...selectedColumns, columnKey];

    onColumnChange(newSelectedColumns);
  };

  return (
    <div className="relative inline-block">
      <ButtonDefault
        icon={<SettingOutlined />}
        disabled={disabled}
        label="Customize Columns"
        variant="outline"
        customClasses="w-max"
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
          <div className="max-h-96 overflow-y-auto">
            {allColumns.map(
              (column: any) =>
                column.key !== "checkbox" && (
                  <label
                    key={column.key}
                    className={`flex cursor-pointer items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                  ${requiredColumns.includes(column.key) ? "opacity-50" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.key)}
                      onChange={() => handleColumnToggle(column.key)}
                      disabled={requiredColumns.includes(column.key)}
                      className="mr-3 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      {column.title?.props?.children || column.title}
                    </span>
                  </label>
                )
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close the dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 h-full w-full"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ColumnSelector;
