import { ColorPicker } from "antd";

interface InputGroupProps {
  customClasses?: string;
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string | number;
  colorValue?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  colorOnChange?: any;
  colorMode?: "single" | "gradient" | ("single" | "gradient")[];
  maxLength?: number;
  pattern?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({
  customClasses,
  label,
  name,
  type,
  placeholder,
  disabled = false,
  required,
  value,
  onChange,
  readOnly = false,
  colorOnChange = () => {},
  colorValue,
  colorMode = "single",
  maxLength,
  pattern = "",
}) => {
  return (
    <>
      <div className={customClasses}>
        {label && (
          <label className="mb-1 block text-body-sm font-medium text-dark dark:text-white">
            {label}
            {required && <span className="text-red"> *</span>}
          </label>
        )}
        {type !== "color" ? (
          <input
            type={type}
            id={name}
            name={name}
            disabled={disabled}
            placeholder={placeholder}
            value={value}
            maxLength={maxLength}
            // pattern={pattern}
            onChange={onChange}
            required={required}
            readOnly={readOnly}
            className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark"
          />
        ) : (
          // <input
          //   type={type}
          //   id={name}
          //   name={name}
          //   disabled={disabled}
          //   placeholder={placeholder}
          //   value={value}
          //   onChange={onChange}
          //   required={required}
          //   readOnly={readOnly}
          //   // className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark"
          //   // className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition placeholder:text-dark-6 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary dark:disabled:bg-dark"
          // />
          <ColorPicker
            defaultValue="#5750F1"
            showText
            size="large"
            allowClear
            disabled={disabled}
            value={colorValue || "#5750F1"}
            mode={colorMode}
            onChange={(value) => colorOnChange({ name, value })}
            format="hex"
          />
        )}
      </div>
      <style>{`
      .ant-color-picker-trigger.ant-color-picker-lg{
        height: 51px;
        justify-content: center;
        align-items: center;
        padding: 0 10px;
      }
      `}</style>
    </>
  );
};

export default InputGroup;
