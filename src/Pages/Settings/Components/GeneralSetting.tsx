import CompanyInfoCard from "./Cards/CompanyInfo";
import ContactInfoCard from "./Cards/ContactInfo";
import SystemSettingsCard from "./Cards/SystemSettings";
import SubscriptionCard from "./Cards/SubscriptionInfo";
import Heading from "../../../components/CommonUI/Heading";

const GeneralSetting = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Heading title="Company Settings" alignCenter />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompanyInfoCard />
        <ContactInfoCard />
        <SystemSettingsCard />
        <SubscriptionCard />
      </div>
    </div>
  );
};

export default GeneralSetting;
