import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ButtonDefault from "../../components/Buttons/ButtonDefault";
import CheckboxTwo from "../../components/FormElements/Checkboxes/CheckboxTwo";
import AllDetailsFields from "../Components/AllDetailsFields";
import AdditionalInformation from "../Components/AdditionalInformation";
import AttachmentTab from "../Components/AttachmentTab";
import CustomAntdTable from "../../components/Tables/CustomAntdTable";
import SelectGroupOne from "../../components/FormElements/SelectGroup/SelectGroupOne";
import TabPanel from "../../components/TabPanel/TabPanel";
import LeadStatusUI from "../../components/CommonUI/LeadStatus/LeadStatus";
import { API } from "../../api";
import { getStoredAgents, getStoredStatus } from "../../api/commonAPI";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import ConfirmationModal from "../../components/Modals/ConfirmationModal";
import AntDateTimePicker from "../../components/FormElements/DatePicker/AntDateTimePicker";
import { isEqual } from "lodash";
import { IoCaretBackOutline } from "react-icons/io5";
// import { Modal } from "antd";
// import AddBooking from "../Booking/AddBooking";
// import { BookingFormValues, PaymentDetail } from "../Booking/AddBooking";

interface LeadHistory {
  _id: string;
  COMMENTED_BY: string;
  DATE: string;
  STATUS: string;
  FOLLOWUP_DATE: string;
  COMMENT: string;
}

interface LeadData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  leadSource: { _id: string; name: string };
  productService: { _id: string; name: string };
  assignedAgent: { _id: string; name: string };
  leadStatus: { _id: string; name: string };
  followUpDate: string;
  description: string;
  fullAddress: string;
  website: string;
  companyName: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  alternatePhone: string;
  leadCost: number;
  addCalender: boolean;
}

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  leadSource: string;
  productService: string;
  assignedAgent: string;
  leadStatus: string;
  description: string;
  companyName: string;
  website: string;
  fullAddress: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  alternatePhone: string;
  leadCost: number;
  comment: string;
  followUpDate?: string;
  addCalender?: boolean;
}

interface GeoLocation {
  _id: string;
  fileName: string;
  originalName: string;
  s3Url: string;
  coordinates: string;
  createdAt: string;
}

const LeadAction = ({
  isModalView = false,
  leadIdProp = "",
  onClose = () => {},
}: {
  isModalView?: boolean;
  leadIdProp?: string;
  onClose?: () => void;
}) => {
  const { leadId } = isModalView
    ? { leadId: leadIdProp }
    : useParams<{ leadId: string }>();

  const agendList = getStoredAgents(true);
  const leadStatusListRaw = getStoredStatus();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFirstCommentClick, setIsFirstCommentClick] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [leadData, setLeadData] = useState<{
    lead: LeadData;
    history: LeadHistory[];
    geoLocation: GeoLocation[];
  } | null>(null);
  const [formData, setFormData] = useState({
    status: "",
    description: "",
    addToCalendar: false,
    followup: "",
    comment: "",
    assignedAgent: "",
    leadWonAmount: 0,
    leadLostReasonId: "",
  });
  const [initialFormData, setInitialFormData] = useState(formData);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  const navigate = useNavigate();

  const hasFormChanges = () => {
    const relevantFormData = {
      ...formData,
      // Exclude comment from comparison if it's the first click
      ...(isFirstCommentClick ? {} : { comment: formData.comment }),
    };

    const relevantInitialData = {
      ...initialFormData,
      // Exclude comment from comparison if it's the first click
      ...(isFirstCommentClick ? {} : { comment: initialFormData.comment }),
    };

    return !isEqual(relevantFormData, relevantInitialData);
  };

  const fetchLeadData = async () => {
    try {
      setIsLoading(true);
      const response = await API.getAuthAPI(`lead/${leadId}`, true);
      if (response.error || !response) return;

      const { leadDetails } = response?.data;
      setLeadData(leadDetails);
      setIsFirstCommentClick(true); // Reset first click state

      const newFormData = {
        status: leadDetails?.lead?.leadStatus?._id,
        description: leadDetails?.lead?.description,
        addToCalendar: leadDetails?.lead?.addCalender,
        followup: leadDetails?.lead?.followUpDate,
        comment: leadDetails?.lead?.comment || "",
        assignedAgent: leadDetails?.lead?.assignedAgent?._id || "",
        leadWonAmount: leadDetails?.lead?.leadWonAmount || 0,
        leadLostReasonId: leadDetails?.lead?.leadLostReasonId || "",
      };

      setFormData(newFormData);
      setInitialFormData(newFormData); // Store initial form data
    } catch (error: any) {
      console.error(error.message || "Failed to fetch lead details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentFocus = () => {
    if (isFirstCommentClick) {
      setFormData((prev) => ({ ...prev, comment: "" }));
      setIsFirstCommentClick(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLeadData();
      setIsFirstCommentClick(true); // Reset first click state
    }
  }, [leadId]);

  const hasFormChanged = () => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };
  // Add this function to handle navigation
  const handleNavigation = () => {
    // Check if there are unsaved changes here if needed
    setShowNavigationModal(true);
  };

  const handleEditMore = () => {
    onClose();
    navigate(`/leads/${leadId}`);
  };

  const handleNavigationConfirm = () => {
    setShowNavigationModal(false);
    navigate(-1);
  };

  const handleUpdateLead = async (updateData: Partial<LeadFormData>) => {
    try {
      setIsUpdating(true);

      const response = await API.updateAuthAPI(
        updateData,
        leadId!,
        "lead",
        true
      );

      if (response.error) return;

      toast.success(response.message || "Lead updated successfully");
      if (isModalView) {
        onClose();
      } else {
        navigate(-1);
      }
    } catch (error: any) {
      console.error(error.message || "Failed to update lead");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
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

  const handleMainFormSubmit = async () => {
    if(!formData) return;
    if (!formData.comment.trim()) {
      toast.error("Please add a comment");
      return;
    }
    const statusId = leadStatusListRaw.find((status) => status.lossStatus);
    let followupDate = formData.followup;
        if (statusId?._id === formData.status) {
      followupDate = formData.followup
        ? formData.followup
        : new Date().toISOString();
    }

    const updateData = {
      leadStatus: formData.status,
      description: formData.description,
      addCalender: formData.addToCalendar,
      followUpDate: followupDate,
      comment: formData.comment,
      assignedAgent: formData.assignedAgent,
      leadWonAmount: formData.leadWonAmount,
      leadLostReasonId: formData.leadLostReasonId || null,
    };

    await handleUpdateLead(updateData);
  };

  // Handle booking modal
  const handleOpenBookingModal = () => {
    setShowBookingModal(true);
  };

  const handleCloseBookingModal = () => {
    setShowBookingModal(false);
  };

  const handleBookingFinish =()=>{
    setShowBookingModal(false);
  }


  const historyColumns = [
    {
      title: "COMMENTED BY",
      dataIndex: "COMMENTED_BY",
      key: "COMMENTED_BY",
    },
    {
      title: "DATE",
      dataIndex: "DATE",
      key: "DATE",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "STATUS",
      dataIndex: "STATUS",
      key: "STATUS",
    },
    {
      title: "FOLLOWUP DATE",
      dataIndex: "FOLLOWUP_DATE",
      key: "FOLLOWUP_DATE",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "COMMENT",
      dataIndex: "COMMENT",
      key: "COMMENT",
    },
  ];

  const staticData = leadData?.lead
    ? [
        {
          fieldName: "Full Name",
          fieldNameValue: `${leadData.lead?.firstName} ${leadData.lead?.lastName}`,
        },
        {
          fieldName: "Email",
          fieldNameValue: leadData.lead?.email,
        },
        {
          fieldName: "Contact Number",
          fieldNameValue: leadData.lead?.contactNumber,
        },
        {
          fieldName: "Region",
          fieldNameValue: `${leadData.lead?.city}, ${leadData.lead?.state}`,
        },
        {
          fieldName: "Lead Source",
          fieldNameValue: leadData.lead?.leadSource?.name,
        },
        {
          fieldName: "Service",
          fieldNameValue: leadData.lead?.productService?.name,
        },
      ]
    : [];

  const tabsData = isModalView
    ? []
    : [
        {
          tabName: "History",
          component: (
            <CustomAntdTable
              columns={historyColumns}
              dataSource={leadData?.history || []}
            />
          ),
        },
        {
          tabName: "All Details",
          component: (
            <AllDetailsFields
              leadData={leadData?.lead}
              onUpdate={handleUpdateLead}
              leadStatus={formData.status}
            />
          ),
        },
        {
          tabName: "Additional Information",
          component: (
            <AdditionalInformation
              leadData={leadData?.lead}
              onUpdate={handleUpdateLead}
              leadStatus={formData.status}
            />
          ),
        },
        {
          tabName: "Geo-Location Record",
          component: (
            <AttachmentTab geoLocations={leadData?.geoLocation || []} leadId={leadData?.lead?._id}
            />
          ),
        },
      ];

  if (isLoading) {
    return <MiniLoader />;
  }  

  return (
    <div
      className={`rounded-lg bg-white ${
        isModalView ? "" : "p-6 shadow-md"
      } dark:bg-gray-dark`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-dark dark:text-white flex gap-2">
          {!isModalView && (
            <span
              className="flex self-center cursor-pointer"
              onClick={() => {
                 if(hasFormChanged()){
                  setShowNavigationModal(true); 
                 }else{
                  navigate(-1);
                 }
               
              }}
            >
              <IoCaretBackOutline className="inline" />{" "}
            </span>
          )}
          Basic Details
        </h2>
      </div>

      <div className="mb-8 flex w-full flex-col justify-between gap-4 sm:flex-row sm:gap-8">
        <div className="flex w-full flex-col gap-4 border-r-0 pr-0 text-dark dark:text-white sm:border-r-2 sm:pr-8">
          {staticData?.map((item) => (
            <div
              key={item.fieldName}
              className="flex w-full items-center border-b-2 border-solid border-gray py-2"
            >
              <span className="w-[220px] text-lg font-medium">
                {item.fieldName}
              </span>
              <span className="text-base">{item.fieldNameValue}</span>
            </div>
          ))}
          <SelectGroupOne
            label="Agent Name"
            options={agendList}
            selectedOption={formData?.assignedAgent}
            setSelectedOption={(value) =>
              handleSelectChange("assignedAgent", value)
            }
          />
        </div>

        <div className="flex w-full flex-col gap-4">
          <LeadStatusUI
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            formData={formData}
            value={formData.status}
            lostReasonValue={formData.leadLostReasonId}
            // onAddBooking={handleOpenBookingModal}
          />

          <AntDateTimePicker
            label="Followup"
            onChange={handleDateChange}
            defaultValue={formData.followup}
            enableTime
          />

          <div>
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Notes about Lead"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              rows={2}
            />
          </div>

          <div>
            <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
              Comment
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              onFocus={handleCommentFocus}
              placeholder="Add your comment"
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              rows={2}
            />
          </div>

          <div className="flex items-center">
            <CheckboxTwo
              label="Add to Calendar"
              onChange={handleCheckboxChange}
              checked={formData.addToCalendar}
              id="addToCalendar"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full gap-3 justify-center">
        <ButtonDefault
          onClick={handleMainFormSubmit}
          label={isUpdating ? "Updating..." : "Update Lead"}
          variant="primary"
          disabled={isUpdating || !hasFormChanges()}
        />
        {isModalView ? (
          <>
            <ButtonDefault
              onClick={handleEditMore}
              label={"Edit More"}
              variant="secondary"
              disabled={isUpdating}
            />
            <ButtonDefault
              onClick={onClose}
              label={"Cancel"}
              variant="primary"
              customClasses="bg-red-500"
              disabled={isUpdating}
            />
          </>
        ) : // <ButtonDefault
        //   onClick={handleNavigation}
        //   label={"Go Back"}
        //   variant="primary"
        //   disabled={isUpdating}
        // />
        null}
      </div>
      {isModalView ? null : (
        <TabPanel
          tabsData={tabsData}
          type="card"
          defaultActiveKey="1"
          customClassName="mt-6"
        />
      )}

      <ConfirmationModal
        isOpen={showNavigationModal}
        onClose={() => setShowNavigationModal(false)}
        onConfirm={handleNavigationConfirm}
        type="warning"
        title="Confirm Navigation"
        message="Are you sure you want to leave this page? Any unsaved changes will be lost."
        confirmLabel="Leave Page"
        cancelLabel="Stay"
      />

      {/* Booking Modal */}
      {/* <Modal
        title="Add Booking"
        open={showBookingModal}
        onCancel={handleCloseBookingModal}
        footer={null}
        width={1000}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        {leadData?.lead && (
          <AddBooking
            isEditMode={true}
            initialValues={{
              _id: "",
              customer: `${leadData.lead.firstName} ${leadData.lead.lastName}`,
              leadId: { _id: leadData.lead._id, firstName: leadData.lead.firstName, id: leadData.lead._id },
              projectName: leadData.lead.productService?._id || "",
              email: leadData.lead.email,
              contactName: "",
              bookingDate: null,
              RM: "",
              unit: "",
              size: "",
              reference: {
                employee: null,
                tlcp: null,
                avp: null,
                vp: null,
                as: null,
                agm: null,
                gm: null,
                vertical: null
              },
              paymentDetails: [],
              BSP: 0,
              GST: 0,
              OtherCharges: 0,
              TSP: 0,
              totalReceived: 0,
              netRevenue: 0,
              remark: "",
              bookingStatus: "pending"
            }}
            finalCallBack={handleBookingFinish}
          />
        )}
      </Modal> */}
    </div>
  );
};

export default LeadAction;
