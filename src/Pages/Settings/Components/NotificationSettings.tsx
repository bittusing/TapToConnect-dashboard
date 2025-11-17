import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { API } from "../../../api";
import Heading from "../../../components/CommonUI/Heading";
import { Select, TimePicker } from "antd";
import SwitcherTwo from "../../../components/FormElements/Switchers/SwitcherTwo";
import MiniLoader from "../../../components/CommonUI/Loader/MiniLoader";
import { toast } from "react-toastify";

interface NotificationTime {
  time: string;
  isEnabled: boolean;
  _id: string;
}

interface NotificationSettings {
  _id: string;
  statusId: {
    _id: string;
    name: string;
  };
  isEnabled: boolean;
  useFollowUpTime: boolean;
  time: number;
  notificationCustomTime: NotificationTime[];
  recipients: {
    admin: boolean;
    teamLead: boolean;
    regularUser: boolean;
  };
  titleTemplate: string;
  bodyTemplate: string;
}

const timeInterval = [
  { label: "2 minute", value: 2 },
  { label: "5 minute", value: 5 },
  // { label: "15 minute", value: 15 },
  // { label: "30 minute", value: 30 },
  // { label: "1 hour", value: 60 },
  // { label: "2 hour", value: 120 },
  // { label: "4 hour", value: 240 },
];

const NotificationTemplate: React.FC<{
  settings: NotificationSettings;
  onUpdate: (id: string, updatedData: Partial<NotificationSettings>) => void;
}> = ({ settings, onUpdate }) => {
  const [localTitleTemplate, setLocalTitleTemplate] = useState(settings.titleTemplate);
  const [localBodyTemplate, setLocalBodyTemplate] = useState(settings.bodyTemplate);

  const handleMainToggle = (id: string, checked: boolean): void => {
    onUpdate(settings._id, { isEnabled: checked });
  };

  const handleTitleBlur = () => {
    if (localTitleTemplate !== settings.titleTemplate) {
      onUpdate(settings._id, { titleTemplate: localTitleTemplate });
    }
  };

  const handleBodyBlur = () => {
    if (localBodyTemplate !== settings.bodyTemplate) {
      onUpdate(settings._id, { bodyTemplate: localBodyTemplate });
    }
  };

  const handleRecipientToggle = (recipientType: "admin" | "teamLead" | "regularUser") => 
    (id: string, checked: boolean): void => {
      onUpdate(settings._id, {
        recipients: {
          ...settings.recipients,
          [recipientType]: checked,
        },
      });
    };

  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {settings.statusId?.name} Notifications
        </h2>
        <SwitcherTwo
          id={`${settings.statusId?.name?.toLowerCase()}-notifications`}
          defaultChecked={settings.isEnabled}
          onChange={handleMainToggle}
        />
      </div>
      <p className="mb-1 text-gray-600 dark:text-gray-300">
        Reminder settings for upcoming {settings.statusId?.name?.toLowerCase()}s
        and updates
      </p>

      {settings.isEnabled && (
        <>
          {/* Notification Content Section */}
          <div className="mb-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
              <span className="text-blue-500">📝</span> Notification Content
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title Template
                </label>
                <input
                  type="text"
                  value={localTitleTemplate}
                  onChange={(e) => setLocalTitleTemplate(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Body Template
                </label>
                <textarea
                  value={localBodyTemplate}
                  onChange={(e) => setLocalBodyTemplate(e.target.value)}
                  onBlur={handleBodyBlur}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Notification Times Section */}
          <div className="mb-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
              <span className="text-blue-500">⏰</span> Notification Times
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    *{" "}
                    <Select
                      value={settings.time}
                      style={{ width: "auto" }}
                      onChange={(value) => onUpdate(settings._id, { time: value })}
                      options={timeInterval}
                    />{" "}
                    Before Follow-Up Date and Time.
                  </span>
                </div>
                <SwitcherTwo
                  id={`${settings.statusId?.name?.toLowerCase()}-followup-time`}
                  defaultChecked={settings.useFollowUpTime}
                  onChange={(id: any, checked: boolean) =>
                    onUpdate(settings._id, { useFollowUpTime: checked })
                  }
                />
                {/* {settings.notificationCustomTime.map((customTime, index) => (
                <div key={customTime._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-300">
                      * Custom Time:{" "}
                      <TimePicker
                        value={dayjs(customTime.time, 'HH:mm')}
                        format={'HH:mm'}
                        size="small"
                        style={{ width: "auto" }}
                        onChange={(time) => {
                          const newTimes = [...settings.notificationCustomTime];
                          newTimes[index].time = time?.format('HH:mm') || '00:00';
                          onUpdate(settings._id, { notificationCustomTime: newTimes });
                        }}
                      />
                    </span>
                  </div>
                  <SwitcherTwo
                    id={`${settings.statusId?.name?.toLowerCase()}-custom-time-${index}`}
                    defaultChecked={customTime.isEnabled}
                    onChange={handleCustomTimeToggle(index)}
                  />
                </div>
              ))} */}
              </div>
            </div>
          </div>

          {/* Recipients Section */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-white">
              <span className="text-blue-500">👥</span> Recipients
            </h3>
            <div className="space-y-4">
              {/* <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Admin</span>
                <SwitcherTwo
                  id={`${settings.statusId?.name?.toLowerCase()}-admin`}
                  defaultChecked={settings.recipients?.admin}
                  onChange={handleRecipientToggle('admin')}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Team Lead</span>
                <SwitcherTwo
                  id={`${settings.statusId?.name?.toLowerCase()}-teamlead`}
                  defaultChecked={settings.recipients?.teamLead}
                  onChange={handleRecipientToggle('teamLead')}
                />
              </div> */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Assigned Employee
                </span>
                <SwitcherTwo
                  id={`${settings.statusId?.name?.toLowerCase()}-regularuser`}
                  defaultChecked={settings.recipients?.regularUser}
                  onChange={handleRecipientToggle("regularUser")}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatusNotificationSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings[]>([]);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setIsLoading(true);
        const response = await API.getAuthAPI("getNotificationList", true);
        if (response.error) throw new Error(response.error);

        setNotificationSettings(response.data || []);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch notification settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleUpdateSettings = async (
    id: string,
    updatedData: Partial<NotificationSettings>
  ) => {
    try {
      // First update local state for optimistic update
      setNotificationSettings((prev) =>
        prev.map((setting) =>
          setting._id === id ? { ...setting, ...updatedData } : setting
        )
      );

      // Prepare the payload
      const payload = {
        isEnabled: updatedData.isEnabled !== undefined 
          ? updatedData.isEnabled 
          : notificationSettings.find((s) => s._id === id)?.isEnabled,
        useFollowUpTime: updatedData.useFollowUpTime !== undefined 
          ? updatedData.useFollowUpTime 
          : notificationSettings.find((s) => s._id === id)?.useFollowUpTime,
        time: updatedData.time !== undefined 
          ? updatedData.time 
          : notificationSettings.find((s) => s._id === id)?.time,
        notificationCustomTime: updatedData.notificationCustomTime !== undefined 
          ? updatedData.notificationCustomTime?.map(({ time, isEnabled }) => ({ time, isEnabled }))
          : notificationSettings.find((s) => s._id === id)?.notificationCustomTime
              .map(({ time, isEnabled }) => ({ time, isEnabled })),
        recipients: updatedData.recipients !== undefined 
          ? updatedData.recipients 
          : notificationSettings.find((s) => s._id === id)?.recipients,
        titleTemplate: updatedData.titleTemplate !== undefined 
          ? updatedData.titleTemplate 
          : notificationSettings.find((s) => s._id === id)?.titleTemplate,
        bodyTemplate: updatedData.bodyTemplate !== undefined 
          ? updatedData.bodyTemplate 
          : notificationSettings.find((s) => s._id === id)?.bodyTemplate,
      };

      // Make API call
      const response = await API.updateAuthAPI(payload, id, "updateNotification", true);

      if (response.error) throw new Error(response.error);

      // Update local state with server response if needed
      const updatedSetting = response.data;
      setNotificationSettings((prev) =>
        prev.map((setting) =>
          setting._id === id ? { ...setting, ...updatedSetting } : setting
        )
      );

      toast.success("Settings updated successfully.");
    } catch (error: any) {
      // Revert optimistic update on error
      const response = await API.getAuthAPI("getNotificationList", true);
      if (!response.error) {
        setNotificationSettings(response.data || []);
      }
      console.error(error.message || "Failed to update notification settings");
    }
  };

  if (isLoading) {
    return <MiniLoader />;
  }

  return (
    <div className="space-y-6">
      <Heading title="Manage Your Reminders" />
      {notificationSettings.map((settings) => (
        <NotificationTemplate
          key={settings._id}
          settings={settings}
          onUpdate={handleUpdateSettings}
        />
      ))}
    </div>
  );
};

export default StatusNotificationSettings;