import { Modal } from "antd";
import ButtonDefault from "../Buttons/ButtonDefault";
import {
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type?: "warning" | "delete" | "info" | "confirm";
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  width?: number;
  count?: number;
  customIcon?: React.ReactNode;
}

const getIconByType = (type: string, customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;

  switch (type) {
    case "warning":
      return <WarningOutlined className="text-3xl text-yellow-500" />;
    case "delete":
      return <ExclamationCircleOutlined className="text-3xl text-red-500" />;
    case "info":
      return <InfoCircleOutlined className="text-3xl text-blue-500" />;
    case "confirm":
    default:
      return <QuestionCircleOutlined className="text-3xl text-primary" />;
  }
};

const getBackgroundByType = (type: string) => {
  switch (type) {
    case "warning":
      return "bg-yellow-50 dark:bg-yellow-900/20";
    case "delete":
      return "bg-red-50 dark:bg-red-900/20";
    case "info":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "confirm":
    default:
      return "bg-primary/10 dark:bg-primary/20";
  }
};

const getConfirmButtonStyle = (type: string) => {
  switch (type) {
    case "warning":
      return "!bg-yellow-500 hover:!bg-yellow-600";
    case "delete":
      return "!bg-red-500 hover:!bg-red-600";
    case "info":
      return "!bg-blue-500 hover:!bg-blue-600";
    case "confirm":
    default:
      return "";
  }
};

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  type = "confirm",
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this action?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  width = 400,
  count,
  customIcon,
}: ConfirmationModalProps) {
  return (
    <>
      <Modal
        title={null}
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={width}
        className="confirmation-modal"
        centered
      >
        <div className="flex flex-col items-center p-4 text-center">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${getBackgroundByType(
              type
            )}`}
          >
            {getIconByType(type, customIcon)}
          </div>

          <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {count !== undefined ? (
              <>
                {message.replace("{count}", count.toString())}
                {count !== 1 ? "s" : ""}
              </>
            ) : (
              message
            )}
          </p>

          <div className="flex w-full justify-center gap-3">
            <ButtonDefault
              label={cancelLabel}
              variant="outline"
              onClick={onClose}
              customClasses="w-1/2"
            />
            <ButtonDefault
              label={confirmLabel}
              variant="primary"
              onClick={onConfirm}
              customClasses={`w-1/2 ${getConfirmButtonStyle(type)}`}
            />
          </div>
        </div>
      </Modal>

      <style>
        {`
          .confirmation-modal .ant-modal-content {
            border-radius: 12px;
            overflow: hidden;
          }
          
          .dark .confirmation-modal .ant-modal-content {
            background-color: #1f2937;
            border: 1px solid #374151;
          }
          
          .confirmation-modal .ant-modal-close {
            color: #6B7280;
          }
          
          .dark .confirmation-modal .ant-modal-close {
            color: #9CA3AF;
          }
          
          .confirmation-modal .ant-modal-close:hover {
            background-color: #F3F4F6;
          }
          
          .dark .confirmation-modal .ant-modal-close:hover {
            background-color: #374151;
          }
        `}
      </style>
    </>
  );
}

// otherUseCases:

// Basic confirmation
{
  /* <ConfirmationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onConfirm={handleConfirm}
/>

// Delete confirmation
<ConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  type="delete"
  title="Confirm Deletion"
  message={`Are you sure you want to delete ${count} item`}
  count={selectedItems.length}
  confirmLabel="Delete"
/>

// Warning with custom message
<ConfirmationModal
  isOpen={showWarningModal}
  onClose={() => setShowWarningModal(false)}
  onConfirm={handleWarningAction}
  type="warning"
  title="Warning"
  message="This action cannot be undone. Proceed with caution."
  confirmLabel="Proceed"
/>

// Info modal
<ConfirmationModal
  isOpen={showInfoModal}
  onClose={() => setShowInfoModal(false)}
  onConfirm={handleInfoAction}
  type="info"
  title="Complete Action"
  message="Would you like to complete this action now?"
/> */
}
