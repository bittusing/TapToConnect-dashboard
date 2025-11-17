import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import LeadsTableHeader from "./LeadsTableHeader";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { debounce } from "lodash";
import { toast } from "react-toastify";
import QuickEditModal from "../../components/Modals/QuickEdit";
import {
  isWithinNext24Hours,
  isPast24Hours,
} from "../../utils/useFullFunctions";
import { DEFAULT_VISIBLE_COLUMNS, getTableColumns } from "./Columns";

interface Lead {
  key: string;
  name: string;
  number: string;
  leadSource: string;
  agent: string;
  followUpDate: any;
  statusData: any;
  leadWonAmount: number;
  addCalender: boolean;
  leadLostReasonId: string;
  productService: any;
  comment: string;
  leadCost: number;
  companyName: string;
  fullAddress: string;
  city: string;
  website: string;
  createdAt: string;
  pinCode: string;
  email: string;
  description: string;
  updatedAt: string;
  leadAddType: string;
  alternatePhone: string;
  state: string;
  country: string;
}

interface APILead {
  _id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  leadSource: { name: string } | null;
  assignedAgent: { name: string } | null;
  followUpDate: any;
  leadStatus: any;
  leadWonAmount: number;
  addCalender: boolean;
  leadLostReasonId: string;
  productService: { name: string } | null;
  comment: string;
  leadCost: number;
  companyName: string;
  fullAddress: string;
  city: string;
  website: string;
  createdAt: string;
  pinCode: string;
  email: string;
  description: string;
  updatedAt: string;
  leadAddType: string;
  alternatePhone: string;
  state: string;
  country: string;
}

const FollowupLeads = () => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Initialize columns configuration
  const columns = useMemo(
    () =>
      getTableColumns(
        handleSelectAll,
        areAllVisibleRowsSelected,
        rowSelection,
        selectedRowKeys,
        setSelectedLead,
        setIsQuickEditOpen
      ),
    [selectedRowKeys, leads]
  );

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const savedColumns = localStorage.getItem("tableColumns");
    if (savedColumns) {
      const parsed = JSON.parse(savedColumns);
      return parsed.length > 0 ? parsed : DEFAULT_VISIBLE_COLUMNS;
    }
    return DEFAULT_VISIBLE_COLUMNS;
  });

  const transformLeadData = (apiLeads: APILead[]): Lead[] => {
    return apiLeads.map((lead) => ({
      key: lead._id,
      name: `${lead.firstName} ${lead.lastName}`.trim(),
      number: lead.contactNumber,
      leadSource: lead.leadSource?.name || "-",
      productService: lead.productService?.name || "-",
      agent: lead.assignedAgent?.name || "-",
      followUpDate: new Date(lead.followUpDate),
      // followUpDate: new Date(lead.followUpDate).toLocaleString(),
      statusData: lead.leadStatus || {},
      status: lead?.leadStatus?.name || "-",
      service: lead?.productService?.name || "-",
      leadWonAmount: lead.leadWonAmount,
      addCalender: lead.addCalender,
      leadLostReasonId: lead.leadLostReasonId,
      comment: lead.comment,
      leadCost: lead?.leadCost,
      companyName: lead?.companyName || "-",
      fullAddress: lead?.fullAddress || "-",
      city: lead?.city || "-",
      createdAt: lead?.createdAt || "-",
      website: lead?.website || "-",
      pinCode: lead?.pinCode || "-",
      email: lead?.email || "-",
      description: lead?.description || "-",
      updatedAt: lead?.updatedAt || "-",
      leadAddType: lead?.leadAddType || "-",
      alternatePhone: lead?.alternatePhone || "-",
      state: lead?.state || "-",
      country: lead?.country || "-",
    }));
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        type: "followup", // Add type parameter to get only followup leads
        ...advancedFilters,
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const { data, error, options } = await API.getAuthAPI(
        END_POINT.LEADS_FOLLOWUP_DATA,
        true,
        params
      );

      if (error) return;

      const transformedLeads = transformLeadData(data);
      setLeads(transformedLeads);
      setPagination({
        ...pagination,
        total: options.pagination.total,
      });
    } catch (error: any) {
      console.error(error.message || "Failed to fetch followup leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [
    pagination.current,
    pagination.pageSize,
    debouncedSearchTerm,
    advancedFilters,
  ]);

  const handleAdvancedFilter = useCallback((filters: any) => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setAdvancedFilters(filters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setAdvancedFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setPagination({ ...pagination, current: 1 });
    }, 500),
    []
  );

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleQuickUpdate = async (updateData: any) => {
    if (!selectedLead) return;

    try {
      setIsUpdating(true);
      const response = await API.updateAuthAPI(
        updateData,
        selectedLead.key,
        "lead",
        true
      );

      if (response.error) return;
      toast.success("Lead updated successfully");
      setIsQuickEditOpen(false);
      fetchLeads(); // Refresh the leads list
    } catch (error: any) {
      console.error(error.message || "Failed to update lead");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle select all checkbox
  function handleSelectAll({ isChecked }: { isChecked: boolean }) {
    if (isChecked) {
      const visibleKeys = leads.map((lead) => lead.key);
      setSelectedRowKeys((prevSelected) => {
        const uniqueKeys = new Set([...prevSelected, ...visibleKeys]);
        return Array.from(uniqueKeys);
      });
    } else {
      const visibleKeys = new Set(leads.map((lead) => lead.key));
      setSelectedRowKeys((prevSelected) =>
        prevSelected.filter((key) => !visibleKeys.has(key))
      );
    }
  }

  function areAllVisibleRowsSelected() {
    if (leads.length === 0) return false;
    return leads.every((lead) => selectedRowKeys.includes(lead.key));
  }

  function rowSelection({
    value,
    isChecked,
  }: {
    value: string;
    isChecked: boolean;
  }) {
    if (isChecked) {
      setSelectedRowKeys((prev) => [...prev, value]);
    } else {
      setSelectedRowKeys((prev) => prev.filter((key) => key !== value));
    }
  }

  const handleRowClick = (record: any) => {
    setSelectedLead(record);
    setIsQuickEditOpen(true);
    // navigate(`/leads/${record.key}`);
  };

  const handleBulkUpdate = async (data: {
    agentId?: string;
    statusId?: string;
  }) => {
    if (selectedRowKeys.length === 0) return;

    try {
      const payload = {
        leadIds: selectedRowKeys,
        ...(data.agentId && { assignedAgent: data.agentId }),
        ...(data.statusId && { leadStatus: data.statusId }),
      };

      const { data: response, error } = await API.updateAuthAPI(
        payload,
        "",
        END_POINT.BULK_UPDATE,
        true
      );

      if (error) throw new Error(error);

      toast.success(
        response.message ||
          `Successfully updated ${response.modifiedCount} leads`
      );

      // Reset selected rows and refresh data
      setSelectedRowKeys([]);
      fetchLeads();
    } catch (error: any) {
      console.error(error.message || "Failed to update leads");
    }
  };

  const handleDelete = async () => {
    if (selectedRowKeys.length === 0) {
      toast.error("Select alteast one lead.");
      return;
    }

    try {
      const payload = {
        leadIds: selectedRowKeys,
      };

      const { data: response, error } = await API.DeleteAuthAPI(
        "",
        END_POINT.BULK_DELETE,
        true,
        payload
      );

      if (error) throw new Error(error);
      // handleTableChange(1, 10);
      toast.success(
        response.message ||
          `Successfully updated ${response.modifiedCount} leads`
      );

      // Reset selected rows and refresh data
      setSelectedRowKeys([]);
      fetchLeads();
    } catch (error: any) {
      console.error(error.message || "Failed to update leads");
    }
  };

  useEffect(() => {
    console.log("Selected rows:", selectedRowKeys);
  }, [selectedRowKeys]);

  const handleColumnChange = (newColumns: string[]) => {
    setVisibleColumns(newColumns);
    localStorage.setItem("tableColumns", JSON.stringify(newColumns));
  };

  const getVisibleColumns = () => {
    return columns.filter(
      (col) =>
        col.key === "checkbox" ||
        col.key === "action" ||
        visibleColumns.includes(col.key)
    );
  };

  return (
    <div className="space-y-4">
      <LeadsTableHeader
        handleSearch={handleSearch}
        searchTerm={searchTerm}
        selectedCount={selectedRowKeys.length}
        onBulkUpdate={handleBulkUpdate}
        disabled={loading}
        handleDelete={handleDelete}
        onAdvancedFilter={handleAdvancedFilter}
        onResetFilters={handleResetFilters}
        loading={loading}
        columns={columns}
        selectedColumns={visibleColumns}
        onColumnChange={handleColumnChange}
      />

      <CustomAntdTable
        columns={getVisibleColumns()}
        dataSource={leads}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handleTableChange,
          pageSizeOptions: ["10", "20", "50", "100"],
          showSizeChanger: true,
        }}
        rowClassName={(record: Lead) => {
          if (isWithinNext24Hours(record.followUpDate)) {
            // return "bg-green-50 hover:bg-green-100 transition-colors duration-200 animate-in-range";
            return "bg-green-50 hover:bg-green-100 transition-colors duration-200";
          }
          if (isPast24Hours(record.followUpDate)) {
            return "bg-red-50 hover:bg-red-100 transition-colors duration-200";
            // return "bg-red-50 hover:bg-red-100 transition-colors duration-200 animate-in-range";
          }
          return "animate-slide-in";
        }}
        onRow={(record: Lead) => ({
          style: {
            cursor: "pointer",
            transition: "all 0.2s",
          },
          onClick: () => handleRowClick(record),
        })}
        isLoading={loading}
      />
      {selectedLead && (
        <QuickEditModal
          isOpen={isQuickEditOpen}
          onClose={() => {
            fetchLeads();
            setIsQuickEditOpen(false);
            setSelectedLead(null);
          }}
          onSubmit={handleQuickUpdate}
          initialData={{
            id: selectedLead.key,
            status: selectedLead.statusData?._id || "",
            followUpDate: selectedLead.followUpDate,
            leadWonAmount: selectedLead.leadWonAmount,
            addCalender: selectedLead.addCalender, // You might want to get this from your lead data
            leadLostReasonId: selectedLead.leadLostReasonId, // You might want to get this from your lead data
            comment: selectedLead.comment, // You might want to get this from your lead data
            leadName: selectedLead.name,
          }}
          isLoading={isUpdating}
        />
      )}

      <style>{`
       
      `}</style>
    </div>
  );
};

export default FollowupLeads;
