"use client";
import GeneralSetting from "./Components/GeneralSetting";
import DepartmentSetting from "./Components/DepartmentSetting";
// import SubscriptionInfo from "./Components/SubscriptionInfo";
import useScreenHook from "../../hooks/useScreenHook";
import CRMFields from "./Components/CRMFields";
import StorageInsights from "./Components/StorageInsight";
import TabPanel from "../../components/TabPanel/TabPanel";
import RolePermissions from "./Components/RolePermission";
import { useParams } from "react-router-dom";
import NotificationSettings from "./Components/NotificationSettings";
import BlurScreenOverlay from "../../components/CommonUI/BlurScreenOverlay";
import AccessControl from "./Components/AccessControl";

const Settings: React.FC = () => {
  const { id } = useParams();

  const tabsData = [
    {
      tabName: "Company Details",
      component: <GeneralSetting />,
    },
    { tabName: "Department", component: <DepartmentSetting /> },
    { tabName: "CRM Field", component: <CRMFields /> },
    // { tabName: "Subscription", component: <SubscriptionInfo /> },
    { tabName: "Notification Settings", component: <NotificationSettings /> },
    { tabName: "Access Control", component: <AccessControl /> },
    // {
    //   tabName: "Permission Settings",
    //   component: (
    //     // <BlurScreenOverlay
    //     //   title="Permission Settings Coming Soon!"
    //     //   message="We're working hard to bring you Permission Settings features."
    //     //   submessage="Track and manage your permission settings in the next update."
    //     // >
    //       <RolePermissions />
    //     // </BlurScreenOverlay>
    //   ),
    // },
    // {
    //   tabName: "Storage Insights",
    //   component: (
    //     <BlurScreenOverlay
    //       title="Storage Management Coming Soon!"
    //       message="We're working hard to bring you storage management features."
    //       submessage="Track and manage your storage usage in the next update."
    //     >
    //       <StorageInsights />
    //     </BlurScreenOverlay>
    //   ),
    // },
  ];

  const { deviceType } = useScreenHook();

  return (
    <div className="rounded-lg bg-white p-3 pt-0 lg:p-6 lg:pl-0 shadow-md dark:bg-gray-800">
      <div className="flex">
        <div className="w-full">
          {deviceType === "desktop" ? (
            <TabPanel
              tabsData={tabsData}
              type="line"
              tabPosition="left"
              defaultActiveKey={id || "1"}
            />
          ) : (
            <TabPanel
              tabsData={tabsData}
              type="line"
              tabPosition="top"
              defaultActiveKey={id || "1"}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
