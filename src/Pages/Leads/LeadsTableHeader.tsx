import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import { SearchOutlined } from "@ant-design/icons";
import AdvanceFilterUI from "../Components/AdvanceFilterUI";
import useScreenHook from "../../hooks/useScreenHook";
import SearchForm from "../../components/Header/SearchForm";
import { getStoredAgents, getStoredStatus } from "../../api/commonAPI";
import ConfirmationModal from "../../components/Modals/ConfirmationModal";
import ColumnSelector from "../../components/Utils/TableColumnSelector";
import SelectGroupAntd from "../../components/FormElements/SelectGroup/SelectGroupAntd";

interface LeadsTableHeaderProps {
  handleSearch: (value: string) => void;
  searchTerm: string;
  selectedCount: number;
  onBulkUpdate: (data: {
    agentId?: string;
    statusId?: string;
  }) => Promise<void>;
  disabled?: boolean;
  handleDelete: () => void;
  onAdvancedFilter: (filters: any) => void;
  onResetFilters: () => void;
  loading?: boolean;
  initialFilterData?: any;
  showExportButtons?: any;
  onExportPDF?: () => any;
  onExportExcel?: () => any;
  // Add these new props
  columns?: any[];
  selectedColumns?: string[];
  onColumnChange?: (columns: string[]) => void;
}

export default function LeadsTableHeader({
  handleSearch,
  searchTerm,
  selectedCount = 0,
  onBulkUpdate,
  disabled = false,
  handleDelete,
  onAdvancedFilter,
  onResetFilters,
  loading = false,
  initialFilterData = {},
  showExportButtons = false,
  onExportPDF = () => {},
  onExportExcel = () => {},
  columns = [],
  selectedColumns = [],
  onColumnChange,
}: LeadsTableHeaderProps) {
  // Get stored data
  const statusList = getStoredStatus(true);
  const agentList = getStoredAgents(true);
  const { filterType, statusId } = initialFilterData;

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [isAdvanceFilterEnable, setIsAdvanceFilterEnable] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Hooks
  const { deviceType } = useScreenHook();

  const showDeleteConfirmation = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteModalOpen(false);
    handleDelete();
  };

  const handleSubmit = async () => {
    if (!selectedStatus && !selectedAgent) {
      toast.error("Please select either status or agent");
      return;
    }

    if (selectedCount === 0) {
      toast.error("Please select at least one lead");
      return;
    }

    try {
      setIsLoading(true);
      await onBulkUpdate({
        agentId: selectedAgent || undefined,
        statusId: selectedStatus || undefined,
      });

      // Reset selections after successful update
      setSelectedStatus("");
      setSelectedAgent("");
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    await onExportPDF();
  };

  const handleExportExcel = async () => {
    await onExportExcel();
  };

  const exportButtons = (
    <>
      <ButtonDefault
        label="Export PDF"
        variant="outline"
        customClasses="bg-black text-white w-full sm:w-fit"
        onClick={handleExportPDF}
        disabled={loading}
      />
      <ButtonDefault
        label="Export Excel"
        variant="outline"
        customClasses="bg-black text-white w-full sm:w-fit"
        onClick={handleExportExcel}
        disabled={loading}
      />
    </>
  );

  // Update the export buttons section in both desktop and mobile views
  const renderDesktopExportButtons = () => (
    <div className="flex space-x-2">
      {columns && selectedColumns && onColumnChange && (
        <ColumnSelector
          allColumns={columns}
          selectedColumns={selectedColumns}
          onColumnChange={onColumnChange}
          disabled={loading}
        />
      )}
      {showExportButtons && exportButtons}
      {deleteButtons}
    </div>
  );

  const renderMobileExportButtons = () => (
    <div className="mb-4 flex justify-center gap-2">
      {showExportButtons && exportButtons}
      {deleteButtons}
    </div>
  );

  const deleteButtons =
    userRole === "Super Admin" ? (
      <ButtonDefault
        label="Delete"
        variant="outline"
        customClasses="bg-red-500 text-white w-full sm:w-fit"
        disabled={selectedCount === 0}
        onClick={showDeleteConfirmation}
      />
    ) : null;

  const renderMobileView = () => {
    return (
      <>
        <div className="mb-3 flex flex-row gap-2">
          <div className="w-full">
            <SearchForm
              customClasses="border-stroke-dark"
              onSearch={handleSearch}
              searchTerm={searchTerm}
              placeholder="Search leads..."
            />
          </div>
          <div className="w-[30%]">
            <ButtonDefault
              label="Advance Filter"
              variant="outline"
              onClick={() => setIsAdvanceFilterEnable(!isAdvanceFilterEnable)}
            />
          </div>
        </div>
        {isAdvanceFilterEnable && (
          <AdvanceFilterUI
            onFilter={onAdvancedFilter}
            onReset={onResetFilters}
            loading={loading}
          />
        )}

        {selectedCount > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            <span className="text-center text-sm font-medium text-dark dark:text-white">
              Bulk Action on {selectedCount} selected rows
            </span>
            <div className="flex flex-col gap-2">
              <SelectGroupOne
                options={statusList}
                placeholder="Select Status"
                setSelectedOption={setSelectedStatus}
                selectedOption={selectedStatus}
                disabled={disabled || isLoading}
              />
              <SelectGroupOne
                options={agentList}
                placeholder="Select Employee"
                setSelectedOption={setSelectedAgent}
                selectedOption={selectedAgent}
                disabled={disabled || isLoading}
              />
              <ButtonDefault
                label={isLoading ? "Updating..." : "Update Selected"}
                variant="primary"
                onClick={handleSubmit}
                disabled={disabled || isLoading}
                fullWidth
              />
            </div>
          </div>
        )}
        {renderMobileExportButtons()}
      </>
    );
  };

  useEffect(() => {
    if (!filterType && !statusId) {
      setIsAdvanceFilterEnable(false);
    } else {
      setIsAdvanceFilterEnable(true);
    }
  }, [filterType, statusId]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const data = JSON.parse(userStr);
        setUserRole(data?.role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <>
      <div className="mb-4 hidden justify-between sm:flex">
        <div className="hidden flex-col items-center justify-center gap-3 rounded-md border border-stroke bg-white px-6.5 py-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:flex min-w-[530px]">
          <span className="text-base font-medium text-dark dark:text-white">
            Bulk Action{" "}
            {selectedCount ? `on ${selectedCount} selected rows` : null}
          </span>
          <div className="flex gap-2 w-full">
            <SelectGroupAntd
              options={statusList}
              placeholder="Select Status"
              setSelectedOption={setSelectedStatus}
              selectedOption={selectedStatus}
              wrapperClasses="w-full"
              disabled={disabled || isLoading}
              showSearch
            />
            <SelectGroupAntd
              options={agentList}
              placeholder="Select Employee"
              setSelectedOption={setSelectedAgent}
              selectedOption={selectedAgent}
              wrapperClasses="w-full"
              disabled={disabled || isLoading}
              showSearch
            />
            <ButtonDefault
              label={isLoading ? "Updating..." : "Submit"}
              variant="primary"
              onClick={handleSubmit}
              disabled={disabled || isLoading || selectedCount === 0}
            />
          </div>
        </div>
        <div className="hidden flex-col gap-2 sm:flex">
          <ButtonDefault
            icon={<SearchOutlined />}
            label="Advance Filter"
            variant="outline"
            onClick={() => setIsAdvanceFilterEnable(!isAdvanceFilterEnable)}
            fullWidth
          />
          <div className="flex gap-2">
            <ButtonDefault
              mode="link"
              link="/import"
              label="↓ Import"
              variant="outline"
            />
            <ButtonDefault
              mode="link"
              link="/leads/add"
              label="+ Add Lead"
              variant="outline"
            />
          </div>
        </div>
      </div>
      {isAdvanceFilterEnable && deviceType !== "mobile" && (
        <AdvanceFilterUI
          onFilter={onAdvancedFilter}
          onReset={onResetFilters}
          loading={loading}
          initialFilterData={initialFilterData}
          setIsAdvanceFilterEnable={setIsAdvanceFilterEnable}
        />
      )}
      <div className="mb-4 hidden justify-between sm:flex">
        <div className="w-full">
          <SearchForm
            customClasses="border-stroke-dark"
            onSearch={handleSearch}
            searchTerm={searchTerm}
            placeholder="Search leads..."
          />
        </div>
        {renderDesktopExportButtons()}
      </div>
      {deviceType === "mobile" && renderMobileView()}
      {/* // Delete confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        type="delete"
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${selectedCount} item`}
        count={selectedCount}
        confirmLabel="Delete"
      />
    </>
  );
}
