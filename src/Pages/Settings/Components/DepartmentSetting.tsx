import React, { useState, useEffect } from "react";
import { Button, Modal } from "antd";
import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import CustomAntdTable from "../../../components/Tables/CustomAntdTable";
import ButtonDefault from "../../../components/Buttons/ButtonDefault";
import SelectGroupOne from "../../../components/FormElements/SelectGroup/SelectGroupOne";
import InputGroup from "../../../components/FormElements/InputGroup";
import { API } from "../../../api";
import { END_POINT } from "../../../api/UrlProvider";
import SwitcherTwo from "../../../components/FormElements/Switchers/SwitcherTwo";
import ConfirmationModal from "../../../components/Modals/ConfirmationModal";
import SearchForm from "../../../components/Header/SearchForm";
import SelectGroupAntd from "../../../components/FormElements/SelectGroup/SelectGroupAntd";

interface User {
  key: string;
  sNo: number;
  userName: string;
  email: string;
  mobile: string;
  roll: string;
  assignTeamLeader: string;
  isActive: boolean;
  assignedTL?: string;
  bookingStatus: boolean;
}

// Define a type for user data
interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  assignedTL?: string;
  isActive: boolean;
  [key: string]: string | boolean | undefined; // More specific type for dynamic fields
}

interface FormData {
  userName: string;
  email: string;
  mobile: string;
  password: string;
  isActive: string;
  userType: string;
  assignedTL: string;
  superiorRole: string;
  bookingStatus: boolean;
}

// Define role hierarchy
const roleHierarchy: { [key: string]: string } = {
  "Employee": "BDE",
  "BDE": "Sr. BDE",
  "Sr. BDE": "As. Portfolio Manager",
  "As. Portfolio Manager": "Portfolio Manager",
  "Portfolio Manager": "Sr. Portfolio Manager",
  "Sr. Portfolio Manager":"TL",
  "TL": "AGM",
  "AGM": "GM",
  "GM": "AVP",
  "AVP": "VP",
  "VP": "AD",
  "AD": "Vertical"
};

const roleHierarchyEnum: { [key: string]: string } = {
  "Employee": "BDE",
  "BDE": "SRBDE",
  "Sr. BDE": "ASPORTFOLIOMANAGER",
  "As. Portfolio Manager": "PORTFOLIOMANAGER",
  "Portfolio Manager": "SRPORTFOLIOMANAGER",
  "Sr. Portfolio Manager":"TL",
  "TL": "AGM",
  "AGM": "GM",
  "GM": "AVP",
  "AVP": "VP",
  "VP": "AD",
  "AD": "Vertical"
};

export default function DepartmentSetting() {
  const [tableLoading, setTableLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [teamLeads, setTeamLeads] = useState<
    { value: string; label: string }[]
  >([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [assignUserId, setAssignUserId] = useState<string>("");
  const [employees, setEmployees] = useState<
    { value: string; label: string }[]
  >([]);
  const [showAssignUserModal, setShowAssignUserModal] = useState(false);
  // Add state for storing users by role
  const [usersByRole, setUsersByRole] = useState<{
    [role: string]: { value: string; label: string }[];
  }>({});

  console.log({usersByRole});
  

  const initialFormState: FormData = {
    userName: "",
    email: "",
    mobile: "",
    password: "",
    isActive: "active",
    userType: "",
    assignedTL: "",
    superiorRole: "",
    bookingStatus: false,
  };

  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredData, setFilteredData] = useState<User[]>([]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(tableData);
    } else {
      const filtered = tableData.filter(user => 
        user.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, tableData]);

  const fetchUsers = async () => {
    try {
      setTableLoading(true);
      const { data, error } = await API.getAuthAPI(END_POINT.USERS, true);
      if (error) throw new Error(error);

      const transformedData = data.map((user: UserData, index: number) => {
        // Find the superior role field dynamically
        let assignedSuperior = "";
        const roleName=user.role==="Team Leader"? "TL" : user.role
        if (user.role && roleHierarchyEnum[roleName]) {
          const superiorRole = roleHierarchyEnum[roleName];
          const superiorRoleField = `assigned${superiorRole}`;
          assignedSuperior = user[superiorRoleField as keyof UserData] as string || "";
        }
        
        return {
          key: user._id,
          sNo: index + 1,
          userName: user.name,
          email: user.email,
          mobile: user.phone,
          roll: user.role==="Team Leader"? "TL" : user.role,
          assignTeamLeader: assignedSuperior,
          isActive: user.isActive,
          assignedTL: assignedSuperior,
          bookingStatus: user.bookingStatus,
        };
      });

      setTableData(transformedData);

      // Set team leads
      const teamLeadsList = data
        .filter(
          (user: UserData) => user.role === "Team Leader" && user.isActive
        )
        .map((lead: UserData) => ({
          value: lead._id,
          label: lead.name,
        }));
      setTeamLeads(teamLeadsList);

      // Group users by role for assignment
      const usersByRoleMap: { [role: string]: { value: string; label: string }[] } = {};
      
      const roles = Object.keys(roleHierarchy)
      roles.push("Vertical")
      roles.forEach((role) => {
        usersByRoleMap[role] = transformedData
          .filter((user: UserData) => {
            return user.roll === role && user.isActive})
          .map((user: UserData) => ({
            value: user.key,
            label: user.userName,
          }));
      });
      
      setUsersByRole(usersByRoleMap);

      // Set employees for reassignment
      const employeesList = data
        .filter((user: UserData) => user.isActive)
        .map((employee: UserData) => ({
          value: employee._id,
          label: employee.name,
        }));
      setEmployees(employeesList);
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err.message || "Failed to fetch users");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = () => {
    if (!formData.userName.trim()) {
      toast.error("Please enter user name");
      return false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
      toast.error("Please enter email");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    // Mobile validation
    if (!formData.mobile.trim()) {
      toast.error("Please enter mobile number");
      return false;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.mobile.replace(/\D/g, ''))) {
      toast.error("Please enter a valid mobile number (10 digits)");
      return false;
    }
    
    if (!editingUser && !formData.password.trim()) {
      toast.error("Please enter password");
      return false;
    }
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // If changing the user type, reset the assignedTL value
    if (name === "userType") {
      const superiorRole = roleHierarchyEnum[value];
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value, 
        assignedTL: "",
        superiorRole: superiorRole || ""
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (key: string) => {
    const user = tableData.find((user) => user.key === key);
    if (user) {
      // Get the superior role based on the user's role
      const superiorRole = roleHierarchyEnum[user.roll] || "";
      
      setFormData({
        userName: user.userName,
        email: user.email,
        mobile: user.mobile,
        password: "", // Empty for edit mode
        isActive: user.isActive ? "active" : "inactive",
        userType: user.roll,
        assignedTL: user.assignedTL || "",
        superiorRole,
        bookingStatus: user.bookingStatus,
      });
      setEditingUser(key);
      setShowForm(true);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Determine the correct field name for superior role assignment
      let superiorRoleField = "assignedTL"; // default
      if (formData.superiorRole) {
        superiorRoleField = `assigned${formData.superiorRole}`;
      }

      const basePayload = {
        name: formData.userName,
        email: formData.email,
        phone: formData.mobile,
        isActive: formData.isActive === "active",
        [superiorRoleField]: formData.assignedTL || null, // Use dynamic field name
        bookingStatus: formData.bookingStatus,
      };

      if (editingUser) {
        // Update existing user
        const updatePayload = {
          ...basePayload,
          ...(formData.password && { password: formData.password }),
        };

        const { error } = await API.updateAuthAPI(
          updatePayload,
          editingUser,
          "updateDepartment",
          true
        );

        if (error) throw new Error(error);
        toast.success("User updated successfully");
      } else {
        // Create new user
        const createPayload = {
          ...basePayload,
          password: formData.password,
          role: formData.userType==="TL"? "Team Leader" : formData.userType,
        };

        const { error } = await API.postAuthAPI(
          createPayload,
          END_POINT.USER_REGISTER,
          true
        );

        if (error) throw new Error(error);
        toast.success("User created successfully");
      }

      setFormData(initialFormState);
      setEditingUser(null);
      setShowForm(false);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err.message || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: boolean) => {
    try {
      const { error } = await API.updateAuthAPI(
        { isActive: status },
        id,
        "updateDepartment",
        true
      );

      if (error) throw new Error(error);

      toast.success(
        `User ${status ? "activated" : "deactivated"} successfully`
      );
      fetchUsers();
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err.message || "Failed to update status");
    }
  };

  const handleDelete = (key: string) => {
    setDeleteUserId(key);
    setShowDeleteModal(true);
  };

  const handleAssignUser = () => {
    setShowDeleteModal(false);
    setShowAssignUserModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteUserId) return;

    if (!assignUserId) {
      toast.error("Please select an employee to transfer tasks and data to");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        deleteUserId,
        LeadassigenUserId: assignUserId,
      };

      const { error } = await API.DeleteAuthAPI(
        deleteUserId,
        "delete-user",
        true,
        payload,
        false
      );

      if (error) throw new Error(error);

      toast.success("User deleted successfully");
      setShowAssignUserModal(false);
      fetchUsers();
    } catch (error: unknown) {
      const err = error as Error;
      console.error(err.message || "Failed to delete user");
      toast.error(err.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  // Get options for the superior role based on the selected role
  const getSuperiorRoleOptions = (role: string) => {
    const superiorRole = roleHierarchy[role];
    if (!superiorRole) return [];
    
    return usersByRole[superiorRole] || [];
  };

  // Get label for the assign dropdown based on role
  const getAssignLabel = (role: string) => {
    const superiorRole = roleHierarchy[role];
    return superiorRole ? `Assign ${superiorRole}` : "";
  };

  const columns = [
    {
      title: "S.No.",
      dataIndex: "sNo",
      key: "sNo",
      width: 80,
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Role",
      dataIndex: "roll",
      key: "roll",
    },
    // {
    //   title: "Team Leader",
    //   dataIndex: "assignTeamLeader",
    //   key: "assignTeamLeader",
    //   render: (_: unknown, record: User) => {
    //     const lead = teamLeads.find((l) => l.value === record.assignedTL);
    //     return lead?.label || "-";
    //   },
    // },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: User) => (
        <div className="flex items-center gap-2">
          <SwitcherTwo
            id={record.key}
            defaultChecked={record.isActive}
            onChange={(id: string, checked: boolean) =>
              handleStatusChange(id, checked)
            }
          />
          <Button
            icon={<EditOutlined />}
            className="bg-primary text-white"
            onClick={() => handleEdit(record.key)}
          />
          <Button
            icon={<DeleteOutlined />}
            className="bg-red-500 text-white"
            onClick={() => handleDelete(record.key)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Department Management</h2>
        <div className="flex items-center gap-4">
          <SearchForm 
            placeholder="Search by name"
            onSearch={setSearchTerm}
            searchTerm={searchTerm}
          />
          {!showForm && (
            <ButtonDefault
              label="Add New User"
              onClick={() => {
                setShowForm(true);
                setFormData(initialFormState);
                setEditingUser(null);
              }}
              icon={<PlusOutlined />}
            />
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <InputGroup
              label="User Name"
              name="userName"
              type="text"
              placeholder="Enter user name"
              value={formData.userName}
              onChange={handleInputChange}
              required
            />

            <InputGroup
              label="Email"
              name="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />

            <InputGroup
              label="Mobile"
              name="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleInputChange}
              required
            />

            <InputGroup
              label="Password"
              name="password"
              type="password"
              placeholder={
                editingUser ? "Leave blank to keep unchanged" : "Enter password"
              }
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser}
            />

            <SelectGroupOne
              label="Status"
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              selectedOption={formData.isActive}
              setSelectedOption={(value) =>
                handleSelectChange("isActive", value)
              }
            />

            {!editingUser && (
              <SelectGroupOne
                label="Role"
                options={[
                  { value: "Vertical", label: "Vertical" },
                  { value: "AD", label: "AD" },
                  { value: "VP", label: "VP" },
                  { value: "AVP", label: "AVP" },
                  { value: "GM", label: "GM" },
                  { value: "AGM", label: "AGM" },
                  { value: "TL", label: "Team Leader" },
                  { value: "Sr. Portfolio Manager", label: "Sr. Portfolio Manager" },
                  { value: "Portfolio Manager", label: "Portfolio Manager" },
                  { value: "As. Portfolio Manager", label: "As. Portfolio Manager" },
                  { value: "Sr. BDE", label: "Sr. BDE" },
                  { value: "BDE", label: "BDE" },
                  { value: "Employee", label: "Employee" },
                ]}
                selectedOption={formData.userType}
                setSelectedOption={(value) =>
                  handleSelectChange("userType", value)
                }
                required
              />
            )}

            {formData.userType && roleHierarchy[formData.userType] && (
              <SelectGroupOne
                label={getAssignLabel(formData.userType)}
                options={getSuperiorRoleOptions(formData.userType)}
                selectedOption={formData.assignedTL}
                setSelectedOption={(value) =>
                  handleSelectChange("assignedTL", value)
                }
                placeholder={`Select ${roleHierarchy[formData.userType]}`}
              />
            )}
            <SelectGroupOne
              label={"Activate Booking Module"}
              options={[
                { value: true, label: "Enable" },
                { value: false, label: "Disable" },
              ]}
              selectedOption={formData.bookingStatus}
              setSelectedOption={(value) =>
                handleSelectChange("bookingStatus", value)
              }
              placeholder={`Select Enable or Disable`}
            />
          </div>

          <div className="flex gap-3">
            <ButtonDefault
              label={
                isLoading ? "Processing..." : editingUser ? "Update" : "Add"
              }
              onClick={handleSubmit}
              disabled={isLoading}
            />
            <ButtonDefault
              label="Cancel"
              onClick={() => {
                setShowForm(false);
                setFormData(initialFormState);
                setEditingUser(null);
              }}
              variant="outline"
            />
          </div>
        </div>
      )}

      <CustomAntdTable
        columns={columns}
        isLoading={tableLoading}
        dataSource={filteredData}
        pagination={{
          pageSize: 15,
          showSizeChanger: false,
        }}
      />

      {/* Initial Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleAssignUser}
        type="delete"
        title="Confirm User Deletion"
        message="Are you sure you want to delete this user? You'll need to assign all existing tasks and data to another employee."
        confirmLabel="Continue"
        width={500}
      />

      {/* Assign User Modal */}
      <Modal
        title="Assign Tasks and Data"
        open={showAssignUserModal}
        onCancel={() => setShowAssignUserModal(false)}
        footer={null}
        width={500}
      >
        <p className="mb-4 text-gray-600 dark:text-gray-400">
          Select an employee to transfer all tasks and data from the deleted
          user.
        </p>
        <SelectGroupAntd
          label="Assign to Employee"
          options={employees.filter((emp) => emp.value !== deleteUserId)}
          selectedOption={assignUserId}
          setSelectedOption={(value) => setAssignUserId(value)}
          showSearch
          placeholder="Select any RedKaizen employee"
          required
        />

        <div className="mt-6 flex justify-end gap-3">
          <ButtonDefault
            label="Cancel"
            variant="outline"
            onClick={() => setShowAssignUserModal(false)}
          />
          <ButtonDefault
            label={isLoading ? "Processing..." : "Delete and Transfer"}
            variant="primary"
            onClick={confirmDelete}
            customClasses="!bg-red-500 hover:!bg-red-600"
            disabled={!assignUserId || isLoading}
          />
        </div>
      </Modal>
    </div>
  );
}
