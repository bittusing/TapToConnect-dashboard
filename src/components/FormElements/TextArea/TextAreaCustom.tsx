
interface TextAreaProps {
  customClasses?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string | number;
  readOnly?: boolean;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextAreaCustom({
  customClasses,
  label,
  name,
  placeholder,
  disabled = false,
  required,
  value,
  onChange = () => {},
  readOnly = false,
  rows = 6,
}: TextAreaProps) {
  return (
    <div className={customClasses}>
      {label && (
        <label className="mb-1 block text-body-sm font-medium text-dark dark:text-white">
          {label}
          {required && <span className="text-red"> *</span>}
        </label>
      )}
      <textarea
        rows={rows}
        id={name}
        name={name}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
      />
    </div>
  );
}