import React from "react";
import { SelectOption, SelectProps } from "../../../types/selectType";

const SelectGroupOne = ({
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
}: SelectProps & { allowClear?: boolean; isGrouped?: boolean }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption?.(event.target.value);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOption?.("");
  };

  return (
    <div className={`relative ${wrapperClasses}`}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          value={selectedOption || ""}
          onChange={handleChange}
          disabled={disabled}
          className={`
            w-full appearance-none rounded-lg border bg-white px-5 py-[15px] text-sm
            transition duration-200 ease-in-out
            focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:cursor-not-allowed disabled:bg-gray-100
            dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 placeholder:text-dark-6 
            dark:focus:border-primary dark:focus:ring-primary/30
            ${
              disabled
                ? "border-gray-200 text-gray-400"
                : "border-gray-300 text-gray-900"
            }
            ${customClasses}
          `}
          style={customStyles ? JSON.parse(customStyles) : {}}
        >
          <option value="" className="text-dark-6 ">
            {placeholder}
          </option>
          {isGrouped
            ? options.map((group: any) => (
                <optgroup
                  key={group.label}
                  label={group.label}
                  className="font-medium text-gray-900 dark:text-white"
                >
                  {group.options.map((option: SelectOption) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="py-2 text-gray-800 dark:text-gray-200"
                    >
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))
            : options.map((option: SelectOption) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="py-2 text-gray-800 dark:text-gray-200"
                >
                  {option.label}
                </option>
              ))}
        </select>

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
  );
};

export default SelectGroupOne;
