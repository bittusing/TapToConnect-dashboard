import React, { useCallback, useEffect } from "react";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import {
  getStoredAgents,
  getStoredAgentsAsTree,
  getStoredProductsServices,
  getStoredSources,
  getStoredStatus,
} from "../../api/commonAPI";
import dayjs from "dayjs";
import AntDateTimePicker from "../../components/FormElements/DatePicker/AntDateTimePicker";
import SelectGroupAntd from "../../components/FormElements/SelectGroup/SelectGroupAntd";
import TreeSelectAntd from "../../components/FormElements/SelectGroup/TreeSelectAntd";

interface AdvanceFilterUIProps {
  onFilter: (filters: {
    leadStatus?: string;
    assignedAgent?: string;
    productService?: string;
    leadSource?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  onReset: () => void;
  loading?: boolean;
  initialFilterData?: any;
  setIsAdvanceFilterEnable?: any;
}

interface FilterState {
  leadStatus: string;
  assignedAgent: string;
  productService: string;
  leadSource: string;
  startDate: string;
  endDate: string;
}

interface FilterValidFields {
  leadStatus?: string;
  assignedAgent?: string;
  productService?: string;
  leadSource?: string;
  startDate?: string;
  endDate?: string;
}

const AdvanceFilterUI: React.FC<AdvanceFilterUIProps> = ({
  onFilter,
  onReset,
  loading = false,
  initialFilterData = {},
  setIsAdvanceFilterEnable = () => {},
}) => {
  const agentTreeData = getStoredAgentsAsTree();
  const serviceList = getStoredProductsServices(true);
  const sourceList = getStoredSources(true);
  const statusList = getStoredStatus(true);
  const { filterType, statusId } = initialFilterData;

  const [filters, setFilters] = React.useState({
    leadStatus: "",
    assignedAgent: "",
    productService: "",
    leadSource: "",
    startDate: "",
    endDate: "",
  });
  const handleChange = (name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name: string) => (_: Date[], dateStr: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: dateStr,
    }));
  };

  // Memoized filter submission logic
  const submitFilters = useCallback(
    (currentFilters: FilterState) => {
      const validFilters = Object.entries(currentFilters).reduce(
        (acc, [key, value]) => {
          if (value) {
            if (key === "startDate" || key === "endDate") {
              acc[key] = dayjs(value).format("YYYY-MM-DD");
            } else {
              acc[key] = value;
            }
          }
          return acc;
        },
        {} as any
      );

      onFilter(validFilters);
    },
    [onFilter]
  );

  const handleSubmit = () => {
    submitFilters(filters);
  };

  const handleReset = () => {
    setFilters({
      leadStatus: "",
      assignedAgent: "",
      productService: "",
      leadSource: "",
      startDate: "",
      endDate: "",
    });
    onReset();
  };

  // Effect to handle initial filter data
  useEffect(() => {
    const { filterType, statusId } = initialFilterData;

    if (filterType && statusId) {
      const newFilters = {
        ...filters,
        [filterType]: statusId,
      };
      setFilters(newFilters);
      submitFilters(newFilters);
    }
  }, [filterType, statusId, submitFilters]);

  return (
    <div className="rounded-lg bg-white p-6 mb-4 shadow-md dark:bg-gray-800">
      <div className="mb-4 grid sm:grid-cols-6 grid-cols-2 gap-4">
        <SelectGroupAntd
          label="Select Status"
          placeholder="Select Status"
          options={statusList}
          selectedOption={filters.leadStatus}
          setSelectedOption={(value) => handleChange("leadStatus", value)}
          allowClear
          showSearch
        />
         <TreeSelectAntd
          label="Select Employee"
          treeData={agentTreeData}
          selectedOption={filters.assignedAgent}
          setSelectedOption={(value) => handleChange("assignedAgent", value)}
          placeholder="Select Employee"
          showSearch={true}
          allowClear={true}
          treeDefaultExpandAll={true}
          options={[]} // Provide empty array for the required options property
        />
        <SelectGroupAntd
          label="Select Product and Service"
          placeholder="Select Product and Service"
          options={serviceList}
          selectedOption={filters.productService}
          setSelectedOption={(value) => handleChange("productService", value)}
          allowClear
          showSearch
        />
        <SelectGroupAntd
          label="Select Source"
          placeholder="Select Source"
          options={sourceList}
          selectedOption={filters.leadSource}
          setSelectedOption={(value) => handleChange("leadSource", value)}
          allowClear
          showSearch
        />
        
        <AntDateTimePicker
          label="Start Date"
          onChange={handleDateChange("startDate")}
          defaultValue={filters.startDate}
        />
        <AntDateTimePicker
          label="End Date"
          onChange={handleDateChange("endDate")}
          defaultValue={filters.endDate}
        />
      </div>
      <div className="w-full flex justify-center gap-4">
        <ButtonDefault
          label={loading ? "Filtering..." : "Apply Filters"}
          onClick={handleSubmit}
          variant="primary"
          customClasses="bg-blue-500 text-white"
          disabled={loading}
        />
        <ButtonDefault
          label="Reset"
          onClick={handleReset}
          variant="secondary"
          customClasses="bg-black text-white "
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default React.memo(AdvanceFilterUI);
