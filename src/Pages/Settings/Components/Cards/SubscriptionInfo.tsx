import { useState, useEffect } from "react";
import { FaDollarSign } from "react-icons/fa";
import Card from "../../../../components/CommonUI/Card";
import { InfoItem } from "../../../../components/CommonUI/InfoItem";

interface SubscriptionData {
  plan: string;
  startDate: string;
  endDate: string;
  status: string;
  features?: string[];
}

const SubscriptionCard = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    plan: "-",
    startDate: "",
    endDate: "",
    status: "inactive",
    features: [],
  });

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const subscription = userData.company?.subscription || {};
        setSubscriptionData({
          plan: subscription.plan || "-",
          startDate: subscription.startDate || "",
          endDate: subscription.endDate || "",
          status: subscription.status || "inactive",
          features: subscription.features || [],
        });
      } catch (error) {
        console.error("Error loading subscription data:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <FaDollarSign className="text-xl text-primary" />
        <h2 className="text-xl font-semibold dark:text-white">
          Subscription Details
        </h2>
      </div>

      <InfoItem label="Current Plan" value={subscriptionData.plan} />
      <InfoItem
        label="Start Date"
        value={formatDate(subscriptionData.startDate)}
      />
      <InfoItem label="End Date" value={formatDate(subscriptionData.endDate)} />
      <InfoItem
        label="Status"
        value={subscriptionData.status}
        isStatus={true}
      />

      {/* {subscriptionData.features && subscriptionData.features.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Features</p>
          <ul className="list-disc list-inside">
            {subscriptionData.features.map((feature, index) => (
              <li key={index} className="text-gray-700 dark:text-gray-300">
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )} */}
    </Card>
  );
};

export default SubscriptionCard;
