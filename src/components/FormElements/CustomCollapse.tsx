import { Collapse } from "antd";
import type { CollapseProps } from "antd";

export default function CustomCollapse({ items }: CollapseProps) {
  return (
    <>
      <Collapse items={items} className="bg-primary" />

      <style>{`
        .ant-collapse>.ant-collapse-item >.ant-collapse-header .ant-collapse-arrow{
            color: white;
        }
        .dark .ant-collapse .ant-collapse-content>.ant-collapse-content-box{
        background: #122031;
        }
        .dark .ant-collapse{
            border-color: black;
        }
        .dark .ant-collapse .ant-collapse-content{
            border-color: black;

        }
    `}</style>
    </>
  );
}
