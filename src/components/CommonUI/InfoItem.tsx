import React from "react";

interface InfoItemProps {
  label: string;
  value: string;
  isStatus?: boolean;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value, isStatus = false }) => (
  <div className="mb-4">
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
    {isStatus ? (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        value.toLowerCase() === "active" 
          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
      }`}>
        {value}
      </span>
    ) : (
      <p className="font-medium text-gray-900 dark:text-gray-100">{value || "-"}</p>
    )}
  </div>
);