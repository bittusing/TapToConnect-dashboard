import { useState, useEffect, useCallback, useMemo } from "react";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import LeadsTableHeader from "./LeadsTableHeader";
import { useLocation } from "react-router-dom";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { debounce } from "lodash";
import QuickEditModal from "../../components/Modals/QuickEdit";
import { toast } from "react-toastify";
import {
  handleExportExcel,
  handleExportPDF,
} from "../../api/commonAPI/exportApi";
import { getTableColumns } from "./Columns";
import { DEFAULT_VISIBLE_COLUMNS } from './Columns';
import { isWithinPast24Hours } from "../../utils/useFullFunctions";
import { getUserRole } from "../../api/commonAPI";

interface Lead {
  key: string;
  name: string;
  number: string;
  leadSource: string;
  agent: string;
  status: string;
  service: string;
  leadWonAmount: number;
  addCalender: boolean;
  followUpDate: any;
  statusData: any;
  leadLostReasonId: string;
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
  leadStatus: { name: string } | null;
  productService: { name: string } | null;
  leadWonAmount: number;
  addCalender: boolean;
  followUpDate: any;
  leadLostReasonId: string;
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

const AllLeads = ({ derivativeEndpoint = "", showExportButtons = true }) => {
  const location = useLocation();
  const { statusId, filterType } = location.state || {};
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

  // Initialize visible columns state after columns are defined
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
      key: lead?._id,
      name: `${lead?.firstName || ""} ${lead?.lastName || ""}`.trim() || "-",
      number: lead?.contactNumber || "-",
      leadSource: lead?.leadSource?.name || "-",
      agent: lead?.assignedAgent?.name || "-",
      status: lead?.leadStatus?.name || "-",
      service: lead?.productService?.name || "-",
      statusData: lead?.leadStatus || {},
      leadWonAmount: lead?.leadWonAmount,
      addCalender: lead?.addCalender,
      followUpDate: new Date(lead?.followUpDate),
      leadLostReasonId: lead?.leadLostReasonId || "-",
      comment: lead?.comment || "-",
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

  const userRole=getUserRole();

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

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...advancedFilters,
      };
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      const { data, error, options } = await API.getAuthAPI(
        `${END_POINT.LEADS_DATA}${derivativeEndpoint}`,
        true,
        params
      );

      if (error) throw new Error(error);

      const transformedLeads = transformLeadData(data);
      setLeads(transformedLeads);
      setPagination({
        ...pagination,
        total: options?.pagination?.total,
      });
    } catch (error: any) {
      console.error(error.message || "Failed to fetch leads");
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

  // Add this function to handle column visibility changes
  const handleColumnChange = (newColumns: string[]) => {
    setVisibleColumns(newColumns);
    localStorage.setItem("tableColumns", JSON.stringify(newColumns));
  };

  // Filter columns based on visibility
  const getVisibleColumns = () => {
    return columns.filter(
      (col) =>
        col.key === "checkbox" ||
        col.key === "action" ||
        visibleColumns.includes(col.key)
    );
  };

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
  };

  const handleExportPDFLogic = async () => {
    setLoading(true);
    try {
      await handleExportPDF(advancedFilters);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcelLogic = async () => {
    setLoading(true);
    try {
      await handleExportExcel(advancedFilters);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Selected rows:", selectedRowKeys);
  }, [selectedRowKeys]);

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
        initialFilterData={{ statusId, filterType }}
        showExportButtons={showExportButtons && userRole === "Super Admin" }
        onExportPDF={handleExportPDFLogic}
        onExportExcel={handleExportExcelLogic}
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
          const dateValue= record?.createdAt && new Date(record.createdAt) || new Date();          
          if (isWithinPast24Hours(dateValue)) {
            return "bg-blue-light-6 !hover:bg-blue-light-5 transition-colors duration-200";
          }
        }}
        isLoading={loading}
        onRow={(record: any) => ({ onClick: () => handleRowClick(record) })}
      />

      {selectedLead && (
        <QuickEditModal
          isOpen={isQuickEditOpen}
          onClose={() => {
            fetchLeads();
            setIsQuickEditOpen(false);
            setSelectedLead(null);
          }}
          initialData={{
            id: selectedLead.key,
            status: selectedLead.statusData?._id || "",
            followUpDate: selectedLead.followUpDate,
            leadWonAmount: selectedLead.leadWonAmount,
            addCalender: selectedLead.addCalender,
            leadLostReasonId: selectedLead.leadLostReasonId, // You might want to get this from your lead data
            comment: selectedLead.comment, // You might want to get this from your lead data
            leadName: selectedLead.name,
          }}
          isLoading={isUpdating}
        />
      )}
    </div>
  );
};

export default AllLeads;
