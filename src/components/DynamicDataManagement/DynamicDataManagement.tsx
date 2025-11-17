import React, { useState, useEffect } from "react";
import { Button, Tooltip } from "antd";
import {
  EyeFilled,
  EditFilled,
  EyeInvisibleFilled,
  DeleteFilled,
} from "@ant-design/icons";
import InputGroup from "../../components/FormElements/InputGroup";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import CustomAntdTable from "../Tables/CustomAntdTable";
interface Field {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
}

interface DynamicDataManagementProps {
  title: string;
  fields: Field[];
  columns: any[];
  data: any[];
  onAdd: (newItem: any) => void;
  onEdit: (key: string, updatedItem: any) => void;
  onDelete?: (key: string) => void;
  onSoftDelete?: (key: string, status: boolean) => void;
  onUpdate?: (key: string, status: boolean) => void;
  customClasses?: string;
  isLoading?: boolean;
}

const DynamicDataManagement: React.FC<DynamicDataManagementProps> = ({
  title,
  fields,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete = () => {},
  onSoftDelete = () => {},
  onUpdate,
  customClasses = "",
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [sectionOpen, setSectionOpen] = useState<boolean>(false);

  useEffect(() => {
    const initialFormData = fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {} as any);
    setFormData(initialFormData);
  }, [fields]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleColorInputChange = (color: any) => {
    const { name, value } = color;
    setFormData((prevData: any) => ({
      ...prevData,
      [name]: value.toHexString(),
    }));
  };

  const handleSubmit = () => {
    setSectionOpen(false);
    if (editingKey) {
      onEdit(editingKey, formData);
      setEditingKey(null);
    } else {
      onAdd(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    const resetData = fields.reduce((acc, field) => {
      acc[field.name] = "";
      return acc;
    }, {} as any);
    setFormData(resetData);
  };

  const handleEdit = (key: string) => {
    setSectionOpen(true);
    const editingItem = data.find((item) => item.key === key);
    if (editingItem) {
      setFormData(editingItem);
      setEditingKey(key);
    }
  };

  // const handleDelete = (key: string) => {
  //   onDelete(key);
  // };

  const handleUpdate = (key: string, status: boolean) => {
    if (onUpdate) {
      onUpdate(key, status);
    }
  };

  const actionColumn = {
    title: "Action",
    key: "action",
    render: (_: any, record: any) => (
      <span>
        <Tooltip title="Do you want to use this entry in your CRM ? If yes choose open-eye icon. ">
          <Button
            icon={
              record.isActive ? (
                <EyeFilled />
              ) : (
                <EyeInvisibleFilled className="text-red" />
              )
            }
            onClick={() => onSoftDelete(record.key, record.isActive)}
            className="mr-2 text-green-light dark:bg-transparent dark:disabled:text-gray"
            disabled={record.lossStatus || record.wonStatus}
          />
        </Tooltip>
        <Tooltip title="Use this button to Edit this endtry.">
          <Button
            icon={<EditFilled />}
            onClick={() => handleEdit(record.key)}
            className="mr-2 text-blue-500 dark:bg-transparent"
          />
        </Tooltip>
        {/* <Tooltip title="Use this button to Delete this entry.">
          <Button
            icon={<DeleteFilled />}
            onClick={() => onDelete(record.key)}
            className="text-red-500"
          />
        </Tooltip> */}
      </span>
    ),
    width: 150,
  };

  const tableColumns = [...columns, actionColumn];

  return (
    <div className={`rounded-lg bg-white dark:bg-transparent ${customClasses}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-dark dark:text-white sm:text-2xl">
          {title}
        </h2>
        <ButtonDefault
          label={sectionOpen ? "Cancel" : "Add New"}
          onClick={() => setSectionOpen(!sectionOpen)}
        />
      </div>

      {sectionOpen && (
        <div className="mb-4 flex flex-wrap items-end gap-4 lg:flex-nowrap">
          {fields.map((field) => (
            <InputGroup
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder || field.label}
              value={formData[field.name]}
              onChange={handleInputChange}
              colorValue={formData[field.name]}
              colorOnChange={handleColorInputChange}
              customClasses="w-full"
            />
          ))}
          <ButtonDefault
            label={editingKey ? "Update" : "Submit"}
            onClick={handleSubmit}
          />
        </div>
      )}

      <CustomAntdTable
        columns={tableColumns}
        dataSource={data}
        pagination={false}
        className="w-full"
        isLoading={isLoading}
      />

      
    </div>
  );
};

export default DynamicDataManagement;
