import { useState, useEffect } from "react";
import DynamicDataManagement from "../../../components/DynamicDataManagement/DynamicDataManagement";
import { API } from "../../../api";
import { END_POINT } from "../../../api/UrlProvider";
import { toast } from "react-toastify";
import SwitcherTwo from "../../../components/FormElements/Switchers/SwitcherTwo";
import { Tooltip } from "antd";

interface LeadSource {
  key: string;
  leadSourceName: string;
  isActive?: boolean;
  deleted?: boolean;
  isApiRequired?: boolean;
}

const fields = [
  {
    name: "leadSourceName",
    label: "Lead source name",
    type: "text",
  },
];

export default function LeadSourceFieldsCRM() {
  const [data, setData] = useState<LeadSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeadSources = async () => {
    try {
      setIsLoading(true);
      const { data: response, error } = await API.getAuthAPI(
        END_POINT.LEAD_SOURCES,
        true
      );

      if (error) return;

      if (response) {
        // Transform API response to match component's data structure
        const transformedData: LeadSource[] = response.map((item: any) => ({
          key: item._id,
          leadSourceName: item.name,
          isActive: item.isActive,
          deleted: item.deleted,
          isApiRequired: item.isApiRequired,
        }));
        setData(transformedData);
      }
    } catch (error: any) {
      console.error(error.message || "Failed to fetch lead sources");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: "Lead source name",
      dataIndex: "leadSourceName",
      key: "leadSourceName",
    },
    {
      title: "API Integeration",
      dataIndex: "isApiRequired",
      key: "isApiRequired",
      render: (value: any, record: any) => {

        return (
          <Tooltip title="Do you want to use this entry for API integeration ? If yes you can enable the toggle.">
            <div className="flex justify-center">
              <SwitcherTwo
                id={`apiInit-${record.key}`}
                idForAPI={record.key}
                defaultChecked={value}
                onChange={(key: string, value: boolean) =>
                  handlePermissionChange(key, value, record.leadSourceName)
                }
              />
            </div>
          </Tooltip>
        );
      },
    },
  ];

  const handlePermissionChange = async (
    key: string,
    currentStatus: boolean,
    name: string
  ) => {
    try {
      const payload = {
        isApiRequired: currentStatus,
        name: name,
      };

      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.LEAD_SOURCES,
        true
      );

      if (error) return;
      fetchLeadSources();
    } catch (error: any) {
      console.error(error.message || "Failed to update dashboard visibility");
    }
  };

  useEffect(() => {
    fetchLeadSources();
  }, []);

  const handleAdd = async (newItem: any) => {
    try {
      setIsLoading(true);
      const payload = {
        name: newItem.leadSourceName,
      };

      const { error } = await API.postAuthAPI(
        payload,
        END_POINT.LEAD_SOURCES,
        true
      );

      if (error) return;

      toast.success("Lead source added successfully!");
      fetchLeadSources(); // Refresh the list
    } catch (error: any) {
      console.error(error.message || "Failed to add lead source");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (key: string, updatedItem: any) => {
    try {
      setIsLoading(true);
      const payload = {
        name: updatedItem.leadSourceName,
      };

      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.LEAD_SOURCES,
        true
      );

      if (error) return;

      toast.success("Lead source updated successfully!");
      fetchLeadSources(); // Refresh the list
    } catch (error: any) {
      console.error(error.message || "Failed to update lead source");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      setIsLoading(true);
      const { error } = await API.DeleteAuthAPI(
        key,
        END_POINT.LEAD_SOURCES,
        true
      );

      if (error) return;

      toast.success("Lead source deleted successfully!");
      fetchLeadSources(); // Refresh the list
    } catch (error: any) {
      console.error(error.message || "Failed to delete lead source");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoftDelete = async (key: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await API.DeleteAuthAPI(
        key,
        END_POINT.LEAD_SOURCES,
        true
      );

      if (error) return;

      toast.success("Status field deleted successfully!");
      fetchLeadSources();
    } catch (error: any) {
      console.error(error.message || "Failed to delete status field");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (key: string, status: boolean) => {
    try {
      setIsLoading(true);
      const payload = {
        isActive: !status,
      };

      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.LEAD_SOURCES,
        true
      );

      if (error) return;

      fetchLeadSources(); // Refresh the list
    } catch (error: any) {
      console.error(error.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicDataManagement
      title="Lead source name"
      fields={fields}
      columns={columns}
      data={data}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSoftDelete={handleSoftDelete}
      onUpdate={handleUpdate}
      isLoading={isLoading}
    />
  );
}
