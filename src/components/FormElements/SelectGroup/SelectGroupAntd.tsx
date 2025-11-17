import React from "react";
import { Form, Select } from "antd";
import { SelectOption, SelectProps } from "../../../types/selectType";
import "./SelectGroupAntd.css"; // Import custom CSS for styling
interface SelectGroupAntdProps extends SelectProps {
  allowClear?: boolean;
  isGrouped?: boolean;
  showSearch?: boolean;
  name?: string;
  isFormModeOn?: boolean;
}

const SelectGroupAntd = ({
  label,
  options,
  selectedOption,
  setSelectedOption,
  customClasses = "",
  wrapperClasses = "",
  customStyles = "",
  disabled = false,
  required = false,
  placeholder = "Select an option",
  allowClear = false,
  isGrouped = false,
  showSearch = false,
  name = "",
  isFormModeOn = false,
}: SelectGroupAntdProps) => {
  // Handle value change
  const handleChange = (value: string) => {
    setSelectedOption?.(value);
  };

  // Filter options based on search input
  const filterOption = (input: string, option: any) => {
    return (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  };

  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOption?.("");
  };

  return !isFormModeOn ? (
    <div className={`relative ${wrapperClasses}`}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative custom-select-wrapper">
        <Select
          value={selectedOption || undefined}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          allowClear={false} // We'll handle our own clear button
          showSearch={showSearch}
          filterOption={showSearch ? filterOption : false}
          // searchPlaceholder={searchPlaceholder}
          className={`custom-antd-select w-full appearance-none rounded-lg border ${
            disabled
              ? "border-gray-200 text-gray-400"
              : "border-gray-300 text-gray-900"
          } ${customClasses}`}
          style={{
            ...(customStyles ? JSON.parse(customStyles) : {}),
            height: "54px", // Match the height of the original component
          }}
          options={
            isGrouped
              ? options.map((group: any) => ({
                  label: group.label,
                  options: group.options.map((option: SelectOption) => ({
                    value: option.value,
                    label: option.label,
                  })),
                }))
              : options.map((option: SelectOption) => ({
                  value: option.value,
                  label: option.label,
                }))
          }
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          getPopupContainer={(triggerNode) =>
            triggerNode.parentNode as HTMLElement
          }
          suffixIcon={<></>} // Remove the default arrow icon
        />

        {/* Custom arrow and clear button to match the original design */}
        <div className="absolute right-0 top-0 flex h-full items-center space-x-1 pr-2">
          {allowClear && selectedOption && (
            <button
              onClick={handleClear}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              type="button"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <div className="pointer-events-none !m-0 p-0 text-gray-500 dark:text-gray-400">
            <svg
              className="h-4 w-4 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Form.Item
      label={label}
      name={name}
      rules={[{ required: true, message: "Please select a project" }]}
    >
      <Select
        value={selectedOption || undefined}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        allowClear={false} // We'll handle our own clear button
        showSearch={showSearch}
        filterOption={showSearch ? filterOption : false}
        // searchPlaceholder={searchPlaceholder}
        className={`${
          disabled
            ? "border-gray-200 text-gray-400"
            : "border-gray-300 text-gray-900"
        } ${customClasses}`}
        style={{
          ...(customStyles ? JSON.parse(customStyles) : {}),
          // height: "54px", // Match the height of the original component
        }}
        options={
          isGrouped
            ? options.map((group: any) => ({
                label: group.label,
                options: group.options.map((option: SelectOption) => ({
                  value: option.value,
                  label: option.label,
                })),
              }))
            : options.map((option: SelectOption) => ({
                value: option.value,
                label: option.label,
              }))
        }
        dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
        getPopupContainer={(triggerNode) =>
          triggerNode.parentNode as HTMLElement
        }
        suffixIcon={<></>} // Remove the default arrow icon
      />
    </Form.Item>
  );
};

export default SelectGroupAntd;