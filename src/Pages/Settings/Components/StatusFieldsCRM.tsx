import { useState, useEffect, Children } from "react";
import { Checkbox, ColorPicker, Modal, Tooltip } from "antd";
import SwitcherTwo from "../../../components/FormElements/Switchers/SwitcherTwo";
import DynamicDataManagement from "../../../components/DynamicDataManagement/DynamicDataManagement";
import { API } from "../../../api";
import { END_POINT } from "../../../api/UrlProvider";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

interface StatusField {
  key: string;
  status: string;
  display: string;
  onDashboard: boolean;
  color?: string;
  showDashboard?: boolean;
  showFollowUp?: boolean;
  showImported?: boolean;
  showOutSourced?: boolean;
  isActive?: boolean;
  sendNotification?: boolean;
  lossStatus?: false;
  wonStatus?: true;
}

const fields = [
  {
    name: "status",
    label: "Status",
    type: "text",
  },
  {
    name: "color",
    label: "Associated Color",
    type: "color",
  },
];

export default function StatusFieldsCRM() {
  const [data, setData] = useState<StatusField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    key: string;
    type: "won" | "lost";
    checked: boolean;
  } | null>(null);

  const handleCheckboxChange = async (
    key: string,
    type: "won" | "lost",
    checked: boolean
  ) => {
    // Get the current row
    const currentRow = data.find((item) => item.key === key);
    if (!currentRow) return;

    // If trying to uncheck the only checked item of this type across all rows
    const totalCheckedOfType = data.filter((item) =>
      type === "won" ? item.wonStatus : item.lossStatus
    ).length;

    if (
      !checked &&
      totalCheckedOfType === 1 &&
      (type === "won" ? currentRow.wonStatus : currentRow.lossStatus)
    ) {
      setShowWarningModal(true);
      return;
    }

    try {
      const payload: { wonStatus?: boolean; lossStatus?: boolean } = {};

      // If checking a box, ensure the opposite status is unchecked
      if (checked) {
        if (type === "won") {
          payload.wonStatus = true;
          payload.lossStatus = false; // Ensure lost is unchecked
        } else {
          payload.lossStatus = true;
          payload.wonStatus = false; // Ensure won is unchecked
        }
      } else {
        // If unchecking, just uncheck the current type
        payload[type === "won" ? "wonStatus" : "lossStatus"] = false;
      }

      // Find previous checked item of the same type (if checking a new item)
      if (checked) {
        const previousChecked = data.find(
          (item) =>
            item.key !== key &&
            (type === "won" ? item.wonStatus : item.lossStatus)
        );

        // Uncheck the previous item if it exists
        if (previousChecked) {
          await API.updateAuthAPI(
            { [type === "won" ? "wonStatus" : "lossStatus"]: false },
            previousChecked.key,
            END_POINT.LEAD_STATUS,
            true
          );
        }
      }

      // Update the current item
      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) throw new Error(error);

      await fetchStatusFields();
    } catch (error: any) {
      console.error(error.message || "Failed to update status");
    }
  };

  const columns = [
    {
      title: "Status name",
      dataIndex: "status",
      key: "status",
      minWidth: 120,
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      minWidth: 50,
      render: (key: string, record: StatusField) => {
        return (
          <Tooltip
            title={`Color "${record.color}" associated with "${record.status}" status field. You can change the color by clicking on edit button.`}
          >
            <ColorPicker value={record.color} open={false} />
          </Tooltip>
        );
      },
    },
    {
      // title: "Select for",
      // children: [
      //   {
      title: (
        <span className="text-center">
          Show on <br /> Dashboard
        </span>
      ),
      dataIndex: "key",
      key: "key",
      // minWidth: 166,
      render: (key: string, record: StatusField) => (
        <Tooltip title="You can toggle the status field that you want to show on your Dashboard.">
          <div className="flex justify-start">
            <SwitcherTwo
              id={key}
              defaultChecked={record.showDashboard}
              onChange={handleDashboardToggle}
            />
          </div>
        </Tooltip>
      ),
      // },
      // {
      //   title: "Notification",
      //   dataIndex: "key",
      //   key: "key",
      //   // minWidth: 166,
      //   render: (key: string, record: StatusField) => (
      //     <Tooltip title="You can toggle the status field that you want to show on your Dashboard.">
      //       <div className="flex justify-start">
      //         <SwitcherTwo
      //           id={key + "Notification"}
      //           idForAPI={key}
      //           defaultChecked={record.showDashboard}
      //           onChange={handleDashboardToggle}
      //         />
      //       </div>
      //     </Tooltip>
      //   ),
      // },
      // ],
    },
    {
      title: "Filter for following lead pages",
      children: [
        {
          title: "Follow-Up",
          dataIndex: "key",
          key: "key",
          // minWidth: 166,
          render: (key: string, record: StatusField) => (
            <Tooltip
              title={
                <span>
                  All those fields whose toggle is enabled will not be shown in{" "}
                  <Link
                    to="/leads/followup"
                    className="text-green-light hover:text-orange-light "
                    onClick={(e) => e.stopPropagation()}
                  >
                    Follow Up leads page.
                  </Link>
                </span>
              }
            >
              <div className="flex justify-start">
                <SwitcherTwo
                  id={key + "followupFilter"}
                  idForAPI={key}
                  defaultChecked={record.showFollowUp}
                  onChange={(key: string, currentStatus: boolean) =>
                    handleFollowUpToggle(key, currentStatus, "showFollowUp")
                  }
                />
              </div>
            </Tooltip>
          ),
        },
        {
          title: "Imported",
          dataIndex: "key",
          key: "key",
          // minWidth: 166,
          render: (key: string, record: StatusField) => (
            <Tooltip
              title={
                <span>
                  All those fields whose toggle is enabled will not be shown in{" "}
                  <Link
                    to="/leads/imported-leads"
                    className="text-green-light hover:text-orange-light "
                    onClick={(e) => e.stopPropagation()}
                  >
                    Imported Leads page.
                  </Link>
                </span>
              }
            >
              <div className="flex justify-start">
                <SwitcherTwo
                  id={key + "importedLeads"}
                  idForAPI={key}
                  defaultChecked={record.showImported}
                  onChange={(key: string, currentStatus: boolean) =>
                    handleFollowUpToggle(key, currentStatus, "showImported")
                  }
                />
              </div>
            </Tooltip>
          ),
        },
        {
          title: "Out-Sourced",
          dataIndex: "key",
          key: "key",
          // minWidth: 166,
          render: (key: string, record: StatusField) => (
            <Tooltip
              title={
                <span>
                  All those fields whose toggle is enabled will not be shown in{" "}
                  <Link
                    to="/leads/outsourced-leads"
                    className="text-green-light hover:text-orange-light "
                    onClick={(e) => e.stopPropagation()}
                  >
                    Outsourced Leads page.
                  </Link>
                </span>
              }
            >
              <div className="flex justify-start">
                <SwitcherTwo
                  id={key + "outSourcedLeads"}
                  idForAPI={key}
                  defaultChecked={record.showOutSourced}
                  onChange={(key: string, currentStatus: boolean) =>
                    handleFollowUpToggle(key, currentStatus, "showOutSourced")
                  }
                />
              </div>
            </Tooltip>
          ),
        },
      ],
    },
    {
      title: "Treat it as",
      children: [
        {
          title: "Won",
          dataIndex: "key",
          key: "won",
          render: (key: string, record: StatusField) => (
            <Tooltip
              title={
                record.lossStatus
                  ? "Disabled, since already marked as LOST!"
                  : "Mark as WON status"
              }
            >
              <Checkbox
                checked={record.wonStatus}
                disabled={record.lossStatus}
                onChange={(e) =>
                  handleCheckboxChange(key, "won", e.target.checked)
                }
              />
            </Tooltip>
          ),
        },
        {
          title: "Lost",
          dataIndex: "key",
          key: "lost",
          render: (key: string, record: StatusField) => (
            <Tooltip
              title={
                record.wonStatus
                  ? "Disabled, since already marked as WON!"
                  : "Mark as LOST status"
              }
            >
              <Checkbox
                checked={record.lossStatus}
                disabled={record.wonStatus}
                onChange={(e) =>
                  handleCheckboxChange(key, "lost", e.target.checked)
                }
              />
            </Tooltip>
          ),
        },
      ],
    },
  ];

  const fetchStatusFields = async () => {
    try {
      setIsLoading(true);
      const { data: response, error } = await API.getAuthAPI(
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) return;

      if (response) {
        const transformedData: StatusField[] = response.map((item: any) => ({
          key: item._id,
          status: item.name,
          display: item.displayName,
          onDashboard: item.showDashboard,
          color: item.color,
          showDashboard: item.showDashboard,
          showFollowUp: item.showFollowUp,
          showImported: item.showImported,
          showOutSourced: item.showOutSourced,
          isActive: item.isActive,
          sendNotification: item.sendNotification,
          lossStatus: item.lossStatus,
          wonStatus: item.wonStatus,
        }));
        setData(transformedData);
      }
    } catch (error: any) {
      console.error(error.message || "Failed to fetch status fields");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusFields();
  }, []);

  const handleAdd = async (newItem: any) => {
    try {
      setIsLoading(true);
      const payload = {
        displayName: newItem.display,
        name: newItem.status,
        color: newItem.color || "#5750F1", // Default color
      };

      const { error } = await API.postAuthAPI(
        payload,
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) throw new Error(error);

      toast.success("Status field added successfully!");
      fetchStatusFields();
    } catch (error: any) {
      console.error(error.message || "Failed to add status field");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (key: string, updatedItem: any) => {
    try {
      setIsLoading(true);
      const payload = {
        displayName: updatedItem.display,
        name: updatedItem.status,
        color: updatedItem.color || "#0000",
      };

      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) return;

      toast.success("Status field updated successfully!");
      fetchStatusFields();
    } catch (error: any) {
      console.error(error.message || "Failed to update status field");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    try {
      setIsLoading(true);
      const { error } = await API.DeleteAuthAPI(
        key,
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) return;

      toast.success("Status field deleted successfully!");
      fetchStatusFields();
    } catch (error: any) {
      console.error(error.message || "Failed to delete status field");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoftDelete = async (key: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await API.DeleteAuthAPI(
        key,
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) return;

      toast.success("Status field deleted successfully!");
      fetchStatusFields();
    } catch (error: any) {
      console.error(error.message || "Failed to delete status field");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboardToggle = async (key: string, currentStatus: boolean) => {
    try {
      const payload = {
        showDashboard: currentStatus,
      };

      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) return;
      fetchStatusFields();
    } catch (error: any) {
      console.error(error.message || "Failed to update dashboard visibility");
    }
  };

  const handleFollowUpToggle = async (
    key: string,
    currentStatus: boolean,
    field: string
  ) => {
    try {
      const payload = {
        [field]: currentStatus,
      };

      const { error } = await API.updateAuthAPI(
        payload,
        key,
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) return;
      fetchStatusFields();
    } catch (error: any) {
      console.error(error.message || "Failed to update follow-up visibility");
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
        END_POINT.LEAD_STATUS,
        true
      );

      if (error) return;
      fetchStatusFields();
    } catch (error: any) {
      console.error(error.message || "Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DynamicDataManagement
        title="Lead Status List"
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
      <Modal
        title="Warning"
        open={showWarningModal}
        onOk={() => setShowWarningModal(false)}
        onCancel={() => setShowWarningModal(false)}
        okText="OK"
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <p>
          At least one status must be selected. You cannot uncheck this option.
        </p>
      </Modal>
    </>
  );
}
