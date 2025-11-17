import InputGroup from "../../FormElements/InputGroup";
import SelectGroupOne from "../../FormElements/SelectGroup/SelectGroupOne";
import { getStoredLostReason, getStoredStatus } from "../../../api/commonAPI";
import { useEffect, useState } from "react";
// import ButtonDefault from "../../Buttons/ButtonDefault";

interface FormData {
  status: string;
  leadWonAmount: number;
  leadLostReasonId: string;
  [key: string]: unknown;
}

interface LeadStatusUIProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  formData: FormData;
  required?: boolean;
  value: string;
  lostReasonValue: string;
  statusFieldName?: string;
  onAddBooking?: () => void;
}

export default function LeadStatusUI({
  handleInputChange,
  handleSelectChange = () => {},
  formData,
  required = false,
  value,
  lostReasonValue,
  statusFieldName = "status",
  onAddBooking,
}: any) {
  const leadStatusList = getStoredStatus(true);
  const leadStatusListRaw = getStoredStatus();
  const lostReasonList = getStoredLostReason(true);
  const [statusIds, setStatusIds] = useState({
    lostStatusId: "",
    wonStatusId: "",
  });

  const findLostWonStatusId = () => {
    const statusId = leadStatusListRaw.find((status) => status.lossStatus);
    const wonStatusId = leadStatusListRaw.find((status) => status.wonStatus);
    setStatusIds({
      lostStatusId: statusId?._id,
      wonStatusId: wonStatusId?._id,
    });
  };

  const renderHiddenField = (fieldName: string) => {
    if (fieldName === statusIds.wonStatusId) {
      return (
        <>
        <InputGroup
          label="Won amount in INR"
          name="leadWonAmount"
          type="number"
          value={formData.leadWonAmount}
          onChange={handleInputChange}
          required
        />
        {/* <ButtonDefault
          label="Add as Booking"
          onClick={onAddBooking}
          variant="primary"
          customClasses="w-full mt-auto"
        /> */}
        </>
      );
    } else if (fieldName === statusIds.lostStatusId) {
      return (
        <SelectGroupOne
          label="Lost Reason"
          required
          options={lostReasonList}
          selectedOption={lostReasonValue}
          setSelectedOption={(value) =>
            handleSelectChange("leadLostReasonId", value)
          }
        />
      );
    }
  };

  useEffect(() => {
    findLostWonStatusId();
  }, []);
  
  return (
    <>
      <SelectGroupOne
        label="Lead status"
        required={required}
        options={leadStatusList}
        // setSelectedOption={(value) => handleSelectChange(value)}
        setSelectedOption={(value) =>
          handleSelectChange(statusFieldName, value)
        }
        selectedOption={value}
      />
      {renderHiddenField(formData?.status)}
    </>
  );
}
