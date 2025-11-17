import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Space, Modal } from "antd";
import { toast } from "react-toastify";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ButtonDefault from "../../../components/Buttons/ButtonDefault";
import InputGroup from "../../../components/FormElements/InputGroup";
import SelectGroupAntd from "../../../components/FormElements/SelectGroup/SelectGroupAntd";
import SwitcherTwo from "../../../components/FormElements/Switchers/SwitcherTwo";
import { menuGroups } from "../../../components/Sidebar";
import { API } from "../../../api";
import { END_POINT } from "../../../api/UrlProvider";
import MiniLoader from "../../../components/CommonUI/Loader/MiniLoader";

interface Permission {
  key: string;
  featureName: string;
  route: string;
  group: string;
  add: boolean;
  edit: boolean;
  delete: boolean;
  view: boolean;
  enable: boolean;
  children?: Permission[];
}

interface AccessRole {
  _id: string;
  roleName: string;
  description: string;
  permissions: Permission[];
  createdAt: string;
}

const roleOptions = [
  { label: "Super Admin", value: "Super Admin" },
  { label: "Support Admin", value: "Support Admin" },
  { label: "Admin", value: "Admin" },
  { label: "Tutor", value: "Tutor" },
  { label: "Employee", value: "Employee" },
  { label: "HR", value: "HR" },
  { label: "Finance", value: "Finance" },
  { label: "Project Manager", value: "Project Manager" },
  { label: "Sales", value: "Sales" },
  { label: "User", value: "User" },
];

const AccessControl = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<AccessRole | null>(null);
  
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
  });

  // Transform menuGroups into permissions array
  const initialPermissions: Permission[] = menuGroups.flatMap((group) =>
    group.menuItems
      .filter((item) => item.route !== "#") // Filter out parent items with children
      .map((item, index) => ({
        key: `${group.name}-${index}-${item.route}`,
        featureName: item.label,
        route: item.route,
        group: group.name,
        add: false,
        edit: false,
        delete: false,
        view: false,
        enable: false,
      }))
      .concat(
        group.menuItems
          .filter((item) => item.route === "#" && item.children)
          .flatMap((item) =>
            (item.children || []).map((child, childIndex) => ({
              key: `${group.name}-${item.label}-${childIndex}-${child.route}`,
              featureName: `${item.label} - ${child.label}`,
              route: child.route,
              group: group.name,
              add: false,
              edit: false,
              delete: false,
              view: false,
              enable: false,
            }))
          )
      )
  );

  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await API.getAuthAPI(END_POINT.ROLES, true);
      if (!response.error && response.data) {
        setRoles(response.data || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setFormData({ roleName: "", description: "" });
    setPermissions(initialPermissions.map(p => ({ ...p, add: false, edit: false, delete: false, view: false, enable: false })));
    setIsModalOpen(true);
  };

  const handleEditRole = (role: AccessRole) => {
    setEditingRole(role);
    setFormData({
      roleName: role.roleName,
      description: role.description,
    });
    setPermissions(role.permissions || initialPermissions);
    setIsModalOpen(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await API.DeleteAuthAPI(roleId, END_POINT.ROLES, true);
      if (response.error) throw new Error(response.error);
      
      toast.success("Role deleted successfully");
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role");
    }
  };

  const handlePermissionChange = (
    key: string,
    permissionType: keyof Permission,
    value: boolean
  ) => {
    setPermissions(
      permissions.map((permission) =>
        permission.key === key
          ? { ...permission, [permissionType]: value }
          : permission
      )
    );
  };

  const handleSubmit = async () => {
    if (!formData.roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roleName: formData.roleName,
        description: formData.description,
        permissions: permissions,
      };

      let response;
      if (editingRole) {
        response = await API.updateAuthAPI(
          payload,
          editingRole._id,
          END_POINT.ROLES,
          true
        );
      } else {
        response = await API.postAuthAPI(payload, END_POINT.ROLES, true);
      }

      if (response.error) throw new Error(response.error);
      
      toast.success(`Role ${editingRole ? "updated" : "created"} successfully!`);
      setIsModalOpen(false);
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${editingRole ? "update" : "create"} role`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Group",
      dataIndex: "group",
      key: "group",
      width: 150,
      render: (group: string) => <Tag color="blue">{group}</Tag>,
    },
    {
      title: "Feature Name",
      dataIndex: "featureName",
      key: "featureName",
    },
    {
      title: "Route",
      dataIndex: "route",
      key: "route",
      width: 200,
      render: (route: string) => (
        <span className="text-xs text-gray-500">{route}</span>
      ),
    },
    {
      title: "Add",
      key: "add",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Permission) => (
        <SwitcherTwo
          id={`add-${record.key}`}
          defaultChecked={record.add}
          onChange={() =>
            handlePermissionChange(record.key, "add", !record.add)
          }
        />
      ),
    },
    {
      title: "Edit",
      key: "edit",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Permission) => (
        <SwitcherTwo
          id={`edit-${record.key}`}
          defaultChecked={record.edit}
          onChange={() =>
            handlePermissionChange(record.key, "edit", !record.edit)
          }
        />
      ),
    },
    {
      title: "Delete",
      key: "delete",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Permission) => (
        <SwitcherTwo
          id={`delete-${record.key}`}
          defaultChecked={record.delete}
          onChange={() =>
            handlePermissionChange(record.key, "delete", !record.delete)
          }
        />
      ),
    },
    {
      title: "View",
      key: "view",
      width: 80,
      align: "center" as const,
      render: (_: any, record: Permission) => (
        <SwitcherTwo
          id={`view-${record.key}`}
          defaultChecked={record.view}
          onChange={() =>
            handlePermissionChange(record.key, "view", !record.view)
          }
        />
      ),
    },
  ];

  const roleColumns = [
    {
      title: "Role Name",
      dataIndex: "roleName",
      key: "roleName",
      render: (text: string, record: AccessRole) => (
        <div>
          <div className="font-semibold">{text}</div>
          {record.description && (
            <div className="text-xs text-gray-500">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: "Permissions Count",
      key: "permissions",
      width: 150,
      render: (_: any, record: AccessRole) => {
        const enabledPermissions = (record.permissions || []).filter(
          (p: Permission) => p.view || p.add || p.edit || p.delete
        ).length;
        return <span>{enabledPermissions} permissions</span>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_: any, record: AccessRole) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRole(record._id)}
          />
        </Space>
      ),
    },
  ];

  if (loading && roles.length === 0) return <MiniLoader />;

  return (
    <div className="w-full space-y-6">
      {/* Heading */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Role-Based Access Control
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage dashboard access and permissions for different roles
          </p>
        </div>
        <ButtonDefault
          label="Add New Role"
          variant="primary"
          icon={<PlusOutlined />}
          onClick={handleAddRole}
        />
      </div>

      {/* Roles List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Existing Roles
        </h3>
        <Table
          columns={roleColumns}
          dataSource={roles}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* Permissions Editor - Shown when role is selected */}
      {selectedRole && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Configure Permissions for {selectedRole}
          </h3>
          <Table
            columns={columns}
            dataSource={permissions}
            rowKey="key"
            pagination={false}
            scroll={{ y: 600 }}
          />
        </div>
      )}

      {/* Add/Edit Role Modal */}
      <Modal
        title={editingRole ? "Edit Role" : "Add New Role"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={1000}
      >
        <div className="space-y-6">
          <InputGroup
            label="Role Name"
            name="roleName"
            value={formData.roleName}
            onChange={(e) =>
              setFormData({ ...formData, roleName: e.target.value })
            }
            placeholder="e.g., Instructor, Student, Support"
            required
          />

          <InputGroup
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Brief description of this role"
          />

          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-4">Permissions</h4>
            <Table
              columns={columns}
              dataSource={permissions}
              rowKey="key"
              pagination={false}
              scroll={{ y: 400 }}
              size="small"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <ButtonDefault
              label="Cancel"
              onClick={() => setIsModalOpen(false)}
              variant="outline"
            />
            <ButtonDefault
              label={editingRole ? "Update Role" : "Create Role"}
              onClick={handleSubmit}
              variant="primary"
              loading={loading}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccessControl;

