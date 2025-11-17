import LeadSourceFieldsCRM from "./LeadSourceFieldsCRM";
import StatusFieldsCRM from "./StatusFieldsCRM";
import LostReasonFieldsCRM from "./LostReasonFieldsCRM";
import FacebookPage from "./FacebookPage";

export default function CRMFields() {
  return (
    <div className="flex flex-col gap-5">
      <LeadSourceFieldsCRM />
      <StatusFieldsCRM />
      <LostReasonFieldsCRM />
      <FacebookPage />
    </div>
  );
}
