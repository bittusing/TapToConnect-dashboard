
interface ClientInfo {
  clientName: string;
  domain: string;
  contactNo: string;
  clientEmail: string;
  planSignUpDate: string;
  planExpireDate: string;
  planName: string;
  status: string;
}

const ClientInformationDisplay: React.FC<{ clientInfo: ClientInfo }> = ({
  clientInfo,
}) => {
  const InfoRow: React.FC<{ label: string; value: string }> = ({
    label,
    value,
  }) => (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </div>
      <div className="mt-1 text-md sm:text-lg font-semibold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="mt-2 border-b border-gray-200 dark:border-gray-700"></div>
    </div>
  );

  return (
    <div className=" max-l mx-auto">
      {/* <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto"> */}
      <div className="grid grid-cols-2 gap-6">
        <InfoRow label="Client Name" value={clientInfo.clientName} />
        <InfoRow label="Domain" value={clientInfo.domain} />
        <InfoRow label="Contact No." value={clientInfo.contactNo} />
        <InfoRow label="Client Email" value={clientInfo.clientEmail} />
        <InfoRow label="Plan Sign Up Date" value={clientInfo.planSignUpDate} />
        <InfoRow label="Plan Expire Date" value={clientInfo.planExpireDate} />
        <InfoRow label="Plan Name" value={clientInfo.planName} />
        <InfoRow label="Status" value={clientInfo.status} />
      </div>
    </div>
  );
};

// Example usage
const SubscriptionInfo: React.FC = () => {
  const clientInfo: ClientInfo = {
    clientName: "MAGIEC ADVERTIZEMENT",
    domain: "14B9 4th Floor Dev Nagar Karol B",
    contactNo: "true", // This should be a proper phone number in a real scenario
    clientEmail: "Pincode", // This should be a proper email in a real scenario
    planSignUpDate: "Invalid Date",
    planExpireDate: "Invalid Date",
    planName: "", // This field is empty in the image
    status: "110005",
  };

  return (
    <div className="p-0">
      <h1 className="mb-6 text-center sm:text-2xl text-xl font-bold text-gray-800 dark:text-white">
        Subscription Information
      </h1>
      <ClientInformationDisplay clientInfo={clientInfo} />
    </div>
  );
};

export default SubscriptionInfo;
