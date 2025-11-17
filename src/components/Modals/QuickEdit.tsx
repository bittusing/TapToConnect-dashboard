// components/QuickEditModal.tsx
import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import LeadAction from "../../Pages/Leads/LeadAction";

interface QuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: any) => Promise<void>;
  initialData: {
    id: string;
    status: string;
    followUpDate: string;
    leadLostReasonId: string;
    comment: string;
    leadWonAmount: number;
    addCalender: boolean;
    leadName?: string;
  };
  isLoading?: boolean;
}

const QuickEditModal: React.FC<QuickEditModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    status: initialData.status,
    followup: initialData.followUpDate,
    leadWonAmount: initialData.leadWonAmount || 0,
    addCalender: initialData.addCalender || false,
    comment: initialData.comment || "",
    leadLostReasonId: initialData.leadLostReasonId,
  });
  const [firstTimeClick, setFirstTimeClick] = useState(true);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const clearTextArea = (name: string) => {
    if (!firstTimeClick) return;

    setFormData((prev) => ({ ...prev, [name]: "" }));
    setFirstTimeClick(false);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (_selectedDates: Date[], dateStr: string) => {
    setFormData((prev) => ({ ...prev, followup: dateStr }));
  };

  const handleCheckboxChange = ({
    value,
    isChecked,
  }: {
    value: string;
    isChecked: boolean;
  }) => {
    setFormData((prev) => ({ ...prev, [value]: isChecked }));
  };

  const handleSubmit = async () => {
    // await onSubmit({
    //   leadStatus: formData.status,
    //   followUpDate: formData.followup,
    //   addCalender: formData.addCalender,
    //   comment: formData.comment,
    //   leadLostReasonId: formData.leadLostReasonId,
    //   leadWonAmount: formData.leadWonAmount,
    // });
  };

  useEffect(() => {
    setFormData({
      status: initialData.status,
      followup: initialData.followUpDate,
      leadWonAmount: initialData.leadWonAmount || 0,
      addCalender: initialData.addCalender || false,
      comment: initialData.comment || "",
      leadLostReasonId: initialData.leadLostReasonId,
    });
  }, [initialData]);

  return (
    <Modal
      // title="Quick Edit Lead"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={"auto"}
      centered
      className="dark:bg-gray-800"
    >
      {/* <div className="space-y-4 py-4 dark:bg-gray-800 dark:text-white">
        <span className="text-body-sm font-medium text-dark dark:text-white">
          Name:{" "}
        </span>
        <span>{initialData.leadName}</span>
        <LeadStatusUI
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          formData={formData}
          defaultValue={formData.status}
          value={formData.status}
          lostReasonValue={formData.leadLostReasonId}
        />
        <AntDateTimePicker
          label="Followup"
          onChange={handleDateChange}
          defaultValue={formData.followup}
          enableTime
        />
        <div>
          <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
            Comment
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onFocus={() => clearTextArea("comment")}
            onChange={handleInputChange}
            placeholder="Add your comment"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
            rows={2}
          />
        </div>
        <div className="flex items-center">
          <CheckboxTwo
            label="Add to Calendar"
            onChange={handleCheckboxChange}
            checked={formData.addCalender}
            idForAPI={"addCalender"}
            id={initialData.id + "Add_to_Calendar_QuickEdit"}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <ButtonDefault
            label="Cancel"
            onClick={onClose}
            variant="secondary"
            customClasses="bg-gray-200 hover:bg-gray-300 text-gray-800"
          />
          <ButtonDefault
            label={isLoading ? "Updating..." : "Update"}
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading}
            customClasses="bg-primary hover:bg-primary/90 text-white"
          />
        </div>
      </div> */}
      <LeadAction leadIdProp={initialData.id} isModalView={true} onClose={onClose} />
    </Modal>
  );
};

export default QuickEditModal;
