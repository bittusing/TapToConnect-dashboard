import React, { useState } from "react";
import { Modal, Table } from "antd";
import { BiPlus } from "react-icons/bi";
import { toast } from "react-toastify";
import ButtonDefault from "../../../components/Buttons/ButtonDefault";
import TextAreaCustom from "../../../components/FormElements/TextArea/TextAreaCustom";
import InputGroup from "../../../components/FormElements/InputGroup";
import SwitcherTwo from "../../../components/FormElements/Switchers/SwitcherTwo";
import SelectGroupOne from "../../../components/FormElements/SelectGroup/SelectGroupOne";
import { menuGroups } from "../../../components/Sidebar";
import Heading from "../../../components/CommonUI/Heading";

interface Permission {
  id: string;
  featureName: string;
  add: boolean;
  edit: boolean;
  delete: boolean;
  view: boolean;
  enable: boolean;
  group: string;
  children?: Permission[];
  key?: string;
}

const roleOptions = [
  { value: "super-admin", label: "Super Admin" },
  { value: "Team-Admin", label: "Team Admin" },
  { value: "User", label: "User" },
];

const RolePermissions = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    featureName: "",
    description: "",
    purpose: "",
    expectedBehavior: "",
  });

  // Transform menuGroups into permissions array with children
  const initialPermissions: Permission[] = menuGroups.flatMap((group) =>
    group.menuItems.map((item, index) => ({
      key: `${group.name}-${index}`,
      id: `${group.name}-${index}`,
      featureName: item.label,
      group: group.name,
      add: false,
      edit: false,
      delete: false,
      view: false,
      enable: false,
      children: item.children?.map((child, childIndex) => ({
        key: `${group.name}-${index}-${childIndex}`,
        id: `${group.name}-${index}-${childIndex}`,
        featureName: child.label,
        group: group.name,
        add: false,
        edit: false,
        delete: false,
        view: false,
        enable: false,
      })),
    }))
  );

  const [permissions, setPermissions] =
    useState<Permission[]>(initialPermissions);

  const handlePermissionChange = (
    id: string,
    type: keyof Permission,
    value: boolean
  ) => {
    const updatePermissionRecursively = (perms: Permission[]): Permission[] => {
      return perms.map((permission) => {
        if (permission.id === id) {
          return { ...permission, [type]: value };
        }
        if (permission.children) {
          return {
            ...permission,
            children: updatePermissionRecursively(permission.children),
          };
        }
        return permission;
      });
    };

    setPermissions(updatePermissionRecursively(permissions));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitFeatureRequest = () => {
    console.log("Feature request:", formData);
    toast.success("Feature request submitted successfully!");
    setIsModalOpen(false);
    setFormData({
      featureName: "",
      description: "",
      purpose: "",
      expectedBehavior: "",
    });
  };

  const columns = [
    // {
    //   title: "Group",
    //   dataIndex: "group",
    //   key: "group",
    //   className: "w-40",
    // },
    {
      title: "Feature Name",
      dataIndex: "featureName",
      key: "featureName",
    },
    // {
    //   title: "Add",
    //   key: "add",
    //   align: "center" as const,
    //   render: (_: any, record: Permission) => (
    //     <div className="flex justify-center">
    //       <SwitcherTwo
    //         id={`add-${record.id}`}
    //         defaultChecked={record.add}
    //         onChange={() =>
    //           handlePermissionChange(record.id, "add", !record.add)
    //         }
    //       />
    //     </div>
    //   ),
    // },
    // {
    //   title: "Edit",
    //   key: "edit",
    //   align: "center" as const,
    //   render: (_: any, record: Permission) => (
    //     <div className="flex justify-center">
    //       <SwitcherTwo
    //         id={`edit-${record.id}`}
    //         defaultChecked={record.edit}
    //         onChange={() =>
    //           handlePermissionChange(record.id, "edit", !record.edit)
    //         }
    //       />
    //     </div>
    //   ),
    // },
    // {
    //   title: "Delete",
    //   key: "delete",
    //   align: "center" as const,
    //   render: (_: any, record: Permission) => (
    //     <div className="flex justify-center">
    //       <SwitcherTwo
    //         id={`delete-${record.id}`}
    //         defaultChecked={record.delete}
    //         onChange={() =>
    //           handlePermissionChange(record.id, "delete", !record.delete)
    //         }
    //       />
    //     </div>
    //   ),
    // },
    // {
    //   title: "View",
    //   key: "view",
    //   align: "center" as const,
    //   render: (_: any, record: Permission) => (
    //     <div className="flex justify-center">
    //       <SwitcherTwo
    //         id={`view-${record.id}`}
    //         defaultChecked={record.view}
    //         onChange={() =>
    //           handlePermissionChange(record.id, "view", !record.view)
    //         }
    //       />
    //     </div>
    //   ),
    // },
    {
      title: "Enable",
      key: "enable",
      align: "center" as const,
      render: (_: any, record: Permission) => (
        <div className="flex justify-center">
          <SwitcherTwo
            id={`view-${record.id}`}
            defaultChecked={record.view}
            onChange={() =>
              handlePermissionChange(record.id, "enable", !record.enable)
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full rounded-lg bg-white dark:bg-gray-800">
      <Heading title="Manage Permission" />
      {/* Role Selection */}
      <div className="mb-6">
        <SelectGroupOne
          label="Select Role"
          options={roleOptions}
          selectedOption={selectedRole}
          setSelectedOption={setSelectedRole}
          placeholder="Choose role"
          wrapperClasses="max-w-md"
        />
      </div>

      {/* Permissions Table */}
      <Table
        columns={columns}
        dataSource={permissions}
        rowKey="id"
        expandable={{
          expandedRowClassName: () => "bg-gray-50 dark:bg-gray-900",
          rowExpandable: (record) =>
            record.children ? record.children.length > 0 : false,
        }}
        className="border border-gray-200 dark:border-gray-700"
        pagination={false}
      />

      {/* Add Feature Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <BiPlus className="-ml-1 mr-2 h-5 w-5" />
          Request New Feature
        </button>
      </div>

      {/* Feature Request Modal */}
      <Modal
        title="Request New Feature"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        className="dark:bg-gray-800"
      >
        <div className="space-y-6 pt-4">
          <InputGroup
            label="Feature Name"
            name="featureName"
            type="text"
            placeholder="Enter the name of the feature"
            value={formData.featureName}
            onChange={handleInputChange}
            required
          />

          <TextAreaCustom
            label="Description"
            name="description"
            placeholder="Describe the feature in detail"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />

          <TextAreaCustom
            label="Business Purpose"
            name="purpose"
            placeholder="What business problem does this feature solve?"
            value={formData.purpose}
            onChange={handleInputChange}
            rows={3}
          />

          <TextAreaCustom
            label="Expected Behavior"
            name="expectedBehavior"
            placeholder="How should this feature work?"
            value={formData.expectedBehavior}
            onChange={handleInputChange}
            rows={3}
          />

          <div className="flex justify-end space-x-4 pt-4">
            <ButtonDefault
              label="Cancel"
              onClick={() => setIsModalOpen(false)}
              variant="outline"
            />
            <ButtonDefault
              label="Submit Request"
              onClick={handleSubmitFeatureRequest}
              variant="primary"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolePermissions;
