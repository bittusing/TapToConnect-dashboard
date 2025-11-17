import { Tabs } from "antd";
const { TabPane } = Tabs;

interface TabComponent {
  tabName: any;
  component: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsInterface {
  tabsData: TabComponent[];
  type?: "line" | "card" | "editable-card";
  customClassName?: string;
  tabPosition?: "top" | "right" | "bottom" | "left";
  defaultActiveKey?: string;
  onChangeHandler?: any;
  size?: "small" | "middle" | "large";
  centered?: boolean;
}

export default function TabPanel({
  tabsData,
  type = "line",
  defaultActiveKey = "1",
  customClassName = "",
  tabPosition = "top",
  size = "small",
  centered = false,
  onChangeHandler = () => {},
}: TabsInterface) {
  return (
    <>
      <Tabs
        defaultActiveKey={defaultActiveKey}
        className={customClassName}
        size={size}
        type={type}
        tabPosition={tabPosition}
        onChange={onChangeHandler}
        centered={centered}
      >
        {tabsData?.map((item: any, index: number) => (
          <TabPane tab={item.tabName} icon={item.icon} key={index + 1}>
            {item.component}
          </TabPane>
        ))}
      </Tabs>
      <style>{`
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #5750f1 !important;
        }
        .dark .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #3b82f6 !important;
        }
        .ant-tabs .ant-tabs-tab:hover {
          color: #5750f1 !important;
        }
        .dark .ant-tabs .ant-tabs-tab-btn {
          color: #fff;
        }
        .ant-tabs .ant-tabs-tab-btn:focus:not(:focus-visible),
        .ant-tabs .ant-tabs-tab-remove:focus:not(:focus-visible),
        .ant-tabs .ant-tabs-tab-btn:active,
        .ant-tabs .ant-tabs-tab-remove:active {
          color: #5750f1 !important;
        }

        .dark .ant-tabs .ant-tabs-tab-btn:focus:not(:focus-visible),
        .ant-tabs .ant-tabs-tab-remove:focus:not(:focus-visible),
        .ant-tabs .ant-tabs-tab-btn:active,
        .ant-tabs .ant-tabs-tab-remove:active {
          color: #3b82f6 !important;
        }
        .ant-tabs-ink-bar {
          background: #5750f1 !important;
        }
        .dark .ant-tabs-ink-bar {
          background: #3b82f6 !important;
        }
        // .dark .ant-tabs-top > .ant-tabs-nav::before,
        // .ant-tabs-bottom > .ant-tabs-nav::before,
        // .ant-tabs-top > div > .ant-tabs-nav::before,
        // .ant-tabs-bottom > div > .ant-tabs-nav::before {
        //   border-bottom: 1px solid grey;
        // }

        .ant-tabs .ant-tabs-tab-btn{
          display: flex;
          align-items: center;
        }
      `}</style>
    </>
  );
}
