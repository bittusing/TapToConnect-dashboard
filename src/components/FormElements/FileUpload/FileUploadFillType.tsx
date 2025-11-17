import { Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";

interface InputGroupProps {
  customClasses?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  ref?: any;
  id?: string;
  accept?: string;
  tooltipInfo?: string;
}

export default function FileUploadFillType({
  customClasses,
  label = "",
  name,
  placeholder,
  disabled = false,
  required = false,
  value,
  onChange = () => {},
  ref,
  id,
  accept,
  tooltipInfo = "",
}: InputGroupProps) {
  return (
    <div>
      {label && (
        <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={ref}
          id={id}
          accept={accept}
          className={`w-full cursor-pointer rounded-[7px] border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-[#E2E8F0] file:px-6.5 file:py-[13px] file:text-body-sm file:font-medium file:text-dark-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-dark dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:file:border-dark-3 dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary ${customClasses}`}
          onChange={onChange}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
        />
        {tooltipInfo && (
          <Tooltip title={tooltipInfo}>
            <QuestionCircleOutlined className="text-gray-500 dark:text-gray-400" />
          </Tooltip>
        )}
      </div>
    </div>
  );
}
