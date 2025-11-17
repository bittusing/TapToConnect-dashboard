import { useEffect, useState } from "react";

const SwitcherTwo = ({
  id,
  defaultChecked,
  onChange = () => {},
  idForAPI = "",
  disabled = false,
}: {
  id: string;
  defaultChecked?: boolean;
  onChange?: any;
  idForAPI?: string;
  disabled?: boolean;
}) => {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer select-none items-center"
      >
        <div className="relative">
          <input
            id={id}
            type="checkbox"
            className="sr-only"
            onChange={() => {
              onChange(idForAPI ? idForAPI : id, !enabled);
              setEnabled(!enabled);
            }}
            disabled={disabled}
          />
          <div className="h-5 w-14 rounded-full bg-gray-3 dark:bg-[#5A616B]"></div>
          <div
            className={`dot shadow-switch-2 absolute -top-1 left-0 h-7 w-7 rounded-full bg-white transition ${
              enabled &&
              "!right-0 !translate-x-full !bg-primary dark:!bg-green-light"
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default SwitcherTwo;
