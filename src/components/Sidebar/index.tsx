import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useLocalStorage from "../../hooks/useLocalStorage";
import ClickOutside from "../ClickOutside";
import SidebarItem from "./SidebarItem";
import { IoSettingsOutline } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaQrcode, FaUsers } from "react-icons/fa";
import { HiShoppingCart } from "react-icons/hi";
import { MdBarChart } from "react-icons/md";
import { FaWallet } from "react-icons/fa";
import useScrollIndicator, {
  ScrollIndicatorButton,
} from "../CommonUI/ScrollIndicator";
import { MenuGroup } from "./types";
import { TbSparkles } from "react-icons/tb";

// Base menu structure - QR operations
export const menuGroups: MenuGroup[] = [
  {
    name: "DASHBOARD",
    menuItems: [
      {
        icon: <LuLayoutDashboard className="text-2xl" />,
        label: "Overview",
        route: "/",
      },
    ],
  },
  {
    name: "QR OPERATIONS",
    menuItems: [
      {
        icon: <FaQrcode className="text-2xl" />,
        label: "Manage Tags",
        route: "/qr/tags",
      },
      {
        icon: <TbSparkles className="text-2xl" />,
        label: "Generate Tags",
        route: "/qr/generate",
      },
      // {
      //   icon: <FaUsers className="text-2xl" />,
      //   label: "Affiliate Partners",
      //   route: "/affiliate-partners",
      // },
    ],
  },
  {
    name: "AFFILIATE PARTNERS",
    menuItems: [
      {
        icon: <FaUsers className="text-2xl" />,
        label: "Affiliate Partners",
        route: "/affiliate-partners",
      },
    ],
  },
  {
    name: "SALES",
    menuItems: [
      {
        icon: <HiShoppingCart className="text-2xl" />,
        label: "Manage Sales",
        route: "/sales",
      },
      {
        icon: <MdBarChart className="text-2xl" />,
        label: "Sales Report",
        route: "/sales/report",
      },
    ],
  },
  {
    name: "WALLET",
    menuItems: [
      {
        icon: <FaWallet className="text-2xl" />,
        label: "My Wallet",
        route: "/wallet",
      },
      {
        icon: <FaWallet className="text-2xl" />,
        label: "Wallet Management",
        route: "/wallet/management",
      },
    ],
  },
  {
    name: "SETUP",
    menuItems: [
      {
        icon: <IoSettingsOutline className="text-2xl" />,
        label: "Settings",
        route: "/settings",
      },
    ],
  },
];

// Function to get role-based menu groups - QR Admin
const getMenuGroups = (userRole: string | null): MenuGroup[] => {
  if (userRole === "Super Admin" || userRole === "Admin" || userRole === "Support Admin") {
    return menuGroups;
  }
  if (userRole === "Affiliate") {
    return menuGroups
      .filter((group) => group.name !== "SETUP")
      .map((group) =>
        group.name === "QR OPERATIONS"
          ? {
              ...group,
              menuItems: group.menuItems.filter(
                (item) => item.label !== "Generate Tags"
              ),
            }
          : group
      )
      .filter((group) => group.menuItems.length > 0)
      // and sale report menu item remove
      .map((group) =>
        group.name === "SALES"
          ? {
              ...group,
              menuItems: group.menuItems.filter(
                (item) => item.label !== "Sales Report"
              ),
            }
          : group
      )
      .filter((group) => group.menuItems.length > 0)
      // Remove Wallet Management for affiliates
      .map((group) =>
        group.name === "WALLET"
          ? {
              ...group,
              menuItems: group.menuItems.filter(
                (item) => item.label !== "Wallet Management"
              ),
            }
          : group
      )
      .filter((group) => group.menuItems.length > 0);
  }

  // Non super-admin users still see operations menu but settings are optional
  return menuGroups
    .map((group) =>
      group.name === "SETUP"
        ? {
            ...group,
            menuItems: group.menuItems.filter(
              (item) => item.label !== "Settings"
            ),
          }
        : group
    )
    .filter((group) => group.menuItems.length > 0);
};

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "overview");
  const { navRef, isVisible, scrollToBottom } = useScrollIndicator();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const data = JSON.parse(userStr);
        setUserRole(data?.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const currentMenuGroups = getMenuGroups(userRole);

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col 
          overflow-y-hidden border-r border-stroke bg-white duration-300 ease-linear 
          dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-5">
          <Link to="/" className="flex items-center">
            <img
              src={"/codersadda_logo_rect.png"}
              alt="Coders Adda Logo"
              className="dark:hidden"
              style={{ width: "auto", height: "60px" }}
            />
            <img
              src={"/codersadda_logo_rect.png"}
              alt="Coders Adda Logo"
              className="hidden dark:block"
              style={{ width: "auto", height: "60px" }}
            />
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="block lg:hidden"
            aria-label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            <svg
              className="fill-current"
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z" />
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="relative flex flex-col overflow-y-hidden">
          <nav
            ref={navRef}
            className="no-scrollbar mt-1 flex-1 overflow-y-auto px-4 lg:px-6"
          >
            {currentMenuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                  {group.name}
                </h3>

                <ul className="mb-6 flex flex-col gap-2">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* Scroll Indicator */}
          {isVisible && (
            <ScrollIndicatorButton onClick={scrollToBottom} className="z-50" />
          )}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;