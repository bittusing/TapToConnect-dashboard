import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClickOutside from "../ClickOutside";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  MdOutlineNotifications,
  MdCalendarToday,
  MdPersonAdd,
} from "react-icons/md";
import { FiBell, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { API } from "../../api";

dayjs.extend(relativeTime);

interface Notification {
  _id: string;
  companyId: string;
  userId: string;
  titleTemplate: string;
  bodyTemplate: string;
  seenStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unSeenNotifIds, setUnSeenNotifIds] = useState([]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await API.getAuthAPI("getNotification", true);

      if (response.error) {
        throw new Error(response.error);
      }

      setNotifications(response.data || []);
      const unseenIds =
        response.data
          ?.filter((notification: Notification) => !notification.seenStatus)
          .map((notification: Notification) => notification._id) || [];

      // Update seen status if there are unseen notifications
      if (unseenIds.length > 0) {
        setUnSeenNotifIds(unseenIds);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSeenStatus = async (notificationIds: string[]) => {
    try {
      if (!notificationIds.length) return;
      const response = await API.PutAuthAPI(
        { notificationIds },
        null,
        "seenUpdate",
        true
      );

      if (response.error) throw new Error(response.error);

      // // Update local state
      // setNotifications((prev) =>
      //   prev.map((notification) =>
      //     notificationIds.includes(notification._id)
      //       ? { ...notification, seenStatus: true }
      //       : notification
      //   )
      // );
    } catch (error: any) {
      console.error("Failed to update notification status:", error);
    }
  };

  useEffect(() => {
  //  fetchNotifications();
  }, []);

  useEffect(() => {
    if (dropdownOpen && unSeenNotifIds) updateSeenStatus(unSeenNotifIds);
  }, [dropdownOpen]);

  // Calculate number of unseen notifications
  const unseenCount = notifications.filter(
    (notification) => !notification.seenStatus
  ).length;

  const handleNotificationClick = (notificationId: string) => {
    // Update local state
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === notificationId
          ? { ...notification, seenStatus: true }
          : notification
      )
    );

    // Here you could also make an API call to update the seenStatus on the server
  };

  const formatTimeAgo = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

  return (
    <ClickOutside
      onClick={() => setDropdownOpen(false)}
      className="relative hidden sm:block"
    >
      <li>
        <Link
          onClick={() => setDropdownOpen(!dropdownOpen)}
          to="#"
          className="relative flex h-12 w-12 items-center justify-center rounded-full border border-stroke bg-gray-2 text-dark hover:text-primary dark:border-dark-4 dark:bg-dark-3 dark:text-white dark:hover:text-white"
        >
          <span className="relative">
            <svg
              className="fill-current duration-300 ease-in-out"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.0001 1.0415C6.43321 1.0415 3.54172 3.933 3.54172 7.49984V8.08659C3.54172 8.66736 3.36981 9.23513 3.04766 9.71836L2.09049 11.1541C0.979577 12.8205 1.82767 15.0855 3.75983 15.6125C4.3895 15.7842 5.0245 15.9294 5.66317 16.0482L5.66475 16.0525C6.30558 17.7624 8.01834 18.9582 10 18.9582C11.9817 18.9582 13.6944 17.7624 14.3352 16.0525L14.3368 16.0483C14.9755 15.9295 15.6106 15.7842 16.2403 15.6125C18.1724 15.0855 19.0205 12.8205 17.9096 11.1541L16.9524 9.71836C16.6303 9.23513 16.4584 8.66736 16.4584 8.08659V7.49984C16.4584 3.933 13.5669 1.0415 10.0001 1.0415ZM12.8137 16.2806C10.9446 16.504 9.05539 16.504 7.18626 16.2806C7.77872 17.1319 8.8092 17.7082 10 17.7082C11.1908 17.7082 12.2213 17.1319 12.8137 16.2806ZM4.79172 7.49984C4.79172 4.62335 7.12357 2.2915 10.0001 2.2915C12.8765 2.2915 15.2084 4.62335 15.2084 7.49984V8.08659C15.2084 8.91414 15.4533 9.72317 15.9124 10.4117L16.8696 11.8475C17.5072 12.804 17.0204 14.104 15.9114 14.4065C12.0412 15.462 7.95893 15.462 4.08872 14.4065C2.9797 14.104 2.49291 12.804 3.13055 11.8475L4.08772 10.4117C4.54676 9.72317 4.79172 8.91414 4.79172 8.08659V7.49984Z"
                fill=""
              />
            </svg>

            {unseenCount > 0 && (
              <span className="absolute -top-0.5 right-0 z-1 h-2.5 w-2.5 rounded-full border-2 border-gray-2 bg-red-light dark:border-dark-3">
                <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-red-light opacity-75"></span>
              </span>
            )}
          </span>
        </Link>

        {dropdownOpen && (
          <div className="absolute -right-27 mt-7.5 flex h-[550px] w-75 flex-col rounded-xl border-[0.5px] border-stroke bg-white px-5.5 pb-5.5 pt-5 shadow-default dark:border-dark-3 dark:bg-gray-dark sm:right-0 sm:w-[364px]">
            <div className="mb-3 flex items-center justify-between">
              <h5 className="text-lg font-medium text-dark dark:text-white">
                Notifications
              </h5>
              {unseenCount > 0 && (
                <span className="rounded-md bg-primary px-2 py-0.5 text-body-xs font-medium text-white">
                  {unseenCount} new
                </span>
              )}
            </div>

            <ul className="no-scrollbar mb-0 flex h-auto flex-col gap-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <li
                    key={notification._id}
                    className={`transition-all duration-300 ${
                      !notification.seenStatus
                        ? "bg-blue-50 dark:bg-blue-900/10"
                        : ""
                    }`}
                  >
                    <Link
                      className="flex items-center gap-4 rounded-[10px] p-2.5 hover:bg-gray-2 dark:hover:bg-dark-3"
                      to="#"
                      onClick={() => handleNotificationClick(notification._id)}
                    >
                      {/* Icon container with background */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          !notification.seenStatus
                            ? "bg-primary/10 text-primary dark:bg-primary/20"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {notification.titleTemplate
                          .toLowerCase()
                          .includes("follow-up") ? (
                          <MdCalendarToday size={20} />
                        ) : notification.titleTemplate
                            .toLowerCase()
                            .includes("new lead") ? (
                          <MdPersonAdd size={20} />
                        ) : notification.titleTemplate
                            .toLowerCase()
                            .includes("notification") ? (
                          <MdOutlineNotifications size={20} />
                        ) : (
                          <FiAlertCircle size={20} />
                        )}
                      </div>

                      <div className="flex w-full flex-col">
                        <div className="flex items-center justify-between">
                          <span className="block font-medium text-dark dark:text-white">
                            {notification.titleTemplate}
                          </span>
                          {!notification.seenStatus && (
                            <span className="h-2 w-2 rounded-full bg-primary"></span>
                          )}
                        </div>
                        <span className="block text-sm text-dark-5 dark:text-dark-6">
                          {notification.bodyTemplate}
                        </span>
                        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))
              ) : (
                <div>No notifications</div>
              )}
            </ul>

            {notifications.length === 0 && (
              <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                No notifications yet
              </div>
            )}

            {/* <Link
              className="mt-auto flex items-center justify-center rounded-[7px] border border-primary p-2.5 font-medium text-primary hover:bg-blue-light-5 dark:border-dark-4 dark:text-dark-6 dark:hover:border-primary dark:hover:bg-blue-light-3 dark:hover:text-primary"
              to="#"
            >
              See all notifications
            </Link> */}
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;
