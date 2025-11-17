import { useState, useEffect } from "react";
import TabPanel from "../../components/TabPanel/TabPanel";
import { API } from "../../api";
import { END_POINT } from "../../api/UrlProvider";
import { toast } from "react-toastify";
import MiniLoader from "../../components/CommonUI/Loader/MiniLoader";
import BulkMessage from "../../components/BulkMessage/BulkMessage";
import { LuUserPlus } from "react-icons/lu";
import { GrDocumentUpload } from "react-icons/gr";
import { SlEnergy } from "react-icons/sl";
import Heading from "../../components/CommonUI/Heading";

const WhatsAppCompose = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [leadsData, setLeadsData] = useState({
    activeLeads: [],
    allLeads: [],
    uploadedContacts: [],
  });

  // Fetch leads based on active tab
  const fetchLeadsData = async (tabKey: string) => {
    try {
      setIsLoading(true);
      let endpoint = "";

      switch (tabKey) {
        case "1":
          endpoint = `${END_POINT.LEADS_DATA}/active`;
          break;
        case "2":
          endpoint = END_POINT.LEADS_DATA;
          break;
        case "3":
          endpoint = `${END_POINT.LEADS_DATA}/contacts`;
          break;
        default:
          endpoint = END_POINT.LEADS_DATA;
      }

      const { data, error } = await API.getAuthAPI(endpoint, true);

      if (error) return;

      // Transform data to match table structure
      const transformedData = data?.map((lead: any) => ({
        key: lead._id,
        name: `${lead.firstName} ${lead.lastName}`,
        number: lead.contactNumber,
        status: lead.leadStatus?.name || "Not Set",
        agent: lead.assignedAgent?.name || "Unassigned",
        followupDate: lead.followUpDate,
      }));

      // Update the appropriate data section
      setLeadsData((prev) => ({
        ...prev,
        [tabKey === "1"
          ? "activeLeads"
          : tabKey === "2"
          ? "allLeads"
          : "uploadedContacts"]: transformedData,
      }));
    } catch (error: any) {
      console.error(error.message || "Failed to fetch leads data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadsData(activeTab);
  }, [activeTab]);

  const getCurrentData = () => {
    switch (activeTab) {
      case "1":
        return leadsData.activeLeads;
      case "2":
        return leadsData.allLeads;
      case "3":
        return leadsData.uploadedContacts;
      default:
        return [];
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const tabsData = [
    {
      key: "1",
      tabName: <span className="text-xl">Active Leads</span>,
      component: isLoading ? (
        <MiniLoader />
      ) : (
        <BulkMessage
          data={getCurrentData()}
          mode={"whatsapp"}
          type="active"
          onRefresh={() => fetchLeadsData(activeTab)}
        />
      ),
      icon: <SlEnergy className="text-2xl" />,
    },
    {
      key: "2",
      tabName: <span className="text-xl">All Leads</span>,
      component: isLoading ? (
        <MiniLoader />
      ) : (
        <BulkMessage
          data={getCurrentData()}
          mode={"whatsapp"}
          type="all"
          onRefresh={() => fetchLeadsData(activeTab)}
        />
      ),
      icon: <LuUserPlus className="text-2xl" />,
    },
    {
      key: "3",
      tabName: <span className="text-xl">Uploaded Contacts</span>,
      component: isLoading ? (
        <MiniLoader />
      ) : (
        <BulkMessage
          data={getCurrentData()}
          mode={"whatsapp"}
          type="contacts"
          onRefresh={() => fetchLeadsData(activeTab)}
        />
      ),
      icon: <GrDocumentUpload className="text-xl" />,
    },
  ];

  return (
    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
      {/* <h2 className="text-xl text-center font-semibold text-dark dark:text-white sm:text-2xl mb-6">
        Create and Send Bulk WhatsApp Messages
      </h2>{" "} */}
      <Heading title="Create and Send Bulk WhatsApp Messages" marginBottom="mb-5"/>
      <TabPanel
        tabsData={tabsData}
        defaultActiveKey={"2"}
        size="large"
        centered
        onChangeHandler={handleTabChange}
        type="card"
      />
    </div>
  );
};

export default WhatsAppCompose;
