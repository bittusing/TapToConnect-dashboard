import { Link, useLocation } from "react-router-dom";
import { SidebarChildItem } from "./types";

interface SidebarDropdownProps {
  items: SidebarChildItem[];
}

const SidebarDropdown = ({ items }: SidebarDropdownProps) => {
  const { pathname } = useLocation();

  return (
    <>
      <ul className="my-2 flex flex-col gap-1.5 pl-9">
        {items.map((dropdownItem) => (
          <li key={dropdownItem.route}>
            <Link
              to={dropdownItem.route}
              className={`relative flex rounded-[7px] px-3.5 py-2 font-medium duration-300 ease-in-out ${
                pathname === dropdownItem.route
                  ? "bg-primary/[.07] text-primary dark:bg-white/10 dark:text-white"
                  : "text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-gray-5 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {dropdownItem.label}
              {dropdownItem.pro && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md bg-primary px-1.5 py-px text-[10px] font-medium leading-[17px] text-white">
                  Pro
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SidebarDropdown;
