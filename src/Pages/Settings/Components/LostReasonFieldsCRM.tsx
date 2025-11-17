import { useState, useEffect } from "react";
import DynamicDataManagement from "../../../components/DynamicDataManagement/DynamicDataManagement";
import { API } from "../../../api";
import { END_POINT } from "../../../api/UrlProvider";
import { toast } from "react-toastify";

interface LostReason {
  key: string;
  reason: string;
  isActive?: boolean;
  order?: number;
}

export default function LostReasonFieldsCRM() {
  const [data, setData] = useState<LostReason[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fields = [
    {
      name: "reason",
      label: "Lost reason name",
      type: "text",
    },
  ];

  const columns = [
    {
      title: "S.No",
      dataIndex: "index",
      key: "index",
      render: (_text: any, _record: any, index: number) => index + 1,
    },
    {
      title: "Lost reasons",
      dataIndex: "reason",
      key: "reason",
    },
  ];

  const fetchLostReasons = async () => {
    try {
      setIsLoading(true);
      const { data: response, error } = await API.getAuthAPI(
        END_POINT.LOST_REASON,
        true
      );

      if (error) return;

      if (response) {
        const transformedData: LostReason[] = response.map((item: any) => ({
          key: item._id,
          reason: item.reason,
          isActive: item.isActive,
          order: item.order,
        }));
        setData(transformedData);
      }
    } catch (error: any) {
      console.error(error.message || "Failed to fetch lost reasons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLostReasons();
  }, []);

  const handleAdd = async (newItem: any) => {
    try {
      setIsLoading(true);
      const payload = {
        reason: newItem.reason,
      };

      const { error } = await API.postAuthAPI(payload, END_POINT.LOST_REASON, true);

      if (error) return;

      toast.success("Lost reason added successfully!");
      fetchLostReasons();
    } catch (error: any) {
      console.error(error.message || "Failed to add lost reason");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (key: string, updatedItem: any) => {
    try {
      setIsLoading(true);
      const payload = {
        reason: updatedItem.reason,
      };

      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.LOST_REASON,
        true
      );

      if (error) return;

      toast.success("Lost reason updated successfully!");
      fetchLostReasons();
    } catch (error: any) {
      console.error(error.message || "Failed to update lost reason");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      setIsLoading(true);
      const { error } = await API.DeleteAuthAPI(key, END_POINT.LOST_REASON, true);

      if (error) return;

      toast.success("Lost reason deleted successfully!");
      fetchLostReasons();
    } catch (error: any) {
      console.error(error.message || "Failed to delete lost reason");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoftDelete = async (key: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await API.DeleteAuthAPI(
        key,
        END_POINT.LOST_REASON,
        true
      );

      if (error) return;

      toast.success("Status field deleted successfully!");
      fetchLostReasons();
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
        END_POINT.LOST_REASON,
        true
      );

      if (error) return;
      fetchLostReasons();
    } catch (error: any) {
      console.error(error.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicDataManagement
      title="Lost Reasons List"
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
