import {
  AGEND_NAMESNewFormat,
  countryOptions,
  leadSourceOptionsNewFormat,
  leadStatusNewFormat,
  lostReasonOptionsNewFormat,
  ROLES,
  serviceOptionsNewFormat,
} from "../../utils/Constants/UsefullJSON";
import { API } from "../index";
import { END_POINT } from "../UrlProvider";
import { toast } from "react-toastify";
interface GeneralData {
  status: any[];
  sources: any[];
  agents: any[];
  productsServices: any[];
  countries: any[];
}

export const fetchGeneralData = async (): Promise<void> => {
  try {
    const { data, error, message } = await API.getAuthAPI(
      END_POINT.GENERAL_DATA,
      true
    );
    const { data: notificationData } = await API.getAuthAPI(
      "getNotification",
      // END_POINT.GENERAL_DATA,
      true
    );

    if (error) return;

    if (data) {
      const {
        status = [],
        sources = [],
        agents = [],
        productsServices = [],
        leadLoseReason = [],
        countries = [],
      } = data;

      // Store each data array separately in localStorage
      localStorage.setItem("crm_status", JSON.stringify(status));
      localStorage.setItem("crm_sources", JSON.stringify(sources));
      localStorage.setItem("crm_agents", JSON.stringify(agents));
      localStorage.setItem("crm_lostReason", JSON.stringify(leadLoseReason));
      localStorage.setItem(
        "crm_products_services",
        JSON.stringify(productsServices)
      );
      localStorage.setItem("crm_countries", JSON.stringify(countries));

      // Optional: Return success message
      //   toast.success("General data updated successfully");
    }
    if (notificationData) {
      localStorage.setItem(
        "crm_notifictaion",
        JSON.stringify(notificationData)
      );
    }
  } catch (error: any) {
    console.error("Error fetching general data:", error);
  }
};

// Helper functions to get data from localStorage
export const getStoredStatus = (forSelectOptions = false): any[] => {
  try {
    const data = localStorage.getItem("crm_status");
    const parsedData = data ? JSON.parse(data) : leadStatusNewFormat;
    const transformedData = parsedData?.map((item: any) => ({
      value: item._id,
      label: item.name,
    }));
    if (!forSelectOptions) {
      return data ? JSON.parse(data) : [];
    } else {
      return transformedData;
    }
  } catch (error) {
    console.error("Error parsing status data:", error);
    return [];
  }
};

export const getStoredLostReason = (forSelectOptions = false): any[] => {
  try {
    const data = localStorage.getItem("crm_lostReason");
    const parsedData = data ? JSON.parse(data) : lostReasonOptionsNewFormat;
    const transformedData = parsedData?.map((item: any) => ({
      value: item._id,
      label: item.reason,
    }));
    if (!forSelectOptions) {
      return data ? JSON.parse(data) : [];
    } else {
      return transformedData;
    }
  } catch (error) {
    console.error("Error parsing status data:", error);
    return [];
  }
};

export const getStoredSources = (forSelectOptions = false): any[] => {
  try {
    const data = localStorage.getItem("crm_sources");
    const parsedData = data ? JSON.parse(data) : leadSourceOptionsNewFormat;
    const transformedData = parsedData?.map((item: any) => ({
      value: item._id,
      label: item.name,
    }));
    if (!forSelectOptions) {
      return data ? JSON.parse(data) : [];
    } else {
      return transformedData;
    }
  } catch (error) {
    console.error("Error parsing sources data:", error);
    return [];
  }
};

export const getStoredAgents = (forSelectOptions = false, includeRole=false): any[] => {
  try {
    const data = localStorage.getItem("crm_agents");
    const parsedData = data ? JSON.parse(data) : AGEND_NAMESNewFormat;
    console.log({parsedData});
    let transformedData = []
    if (includeRole) {
      transformedData = parsedData?.map((item: any) => ({
        value: item._id,
        label: `${item.name}-${item.role}`,
        role: item.role,
      }))
      
    }else{
      transformedData = parsedData?.map((item: any) => ({
        value: item._id,
        label: item.name,
      }));
    }
    
    if (!forSelectOptions) {
      return data ? JSON.parse(data) : [];
    } else {
      return transformedData;
    }
  } catch (error) {
    console.error("Error parsing agents data:", error);
    toast.error("Error parsing agents data");
    return [];
  }
};

/**
 * Get stored agents data formatted as a tree structure for TreeSelectAntd component
 * Organizes agents by their roles in a hierarchical structure
 */
export const getStoredAgentsAsTree = (): any[] => {
  try {
    const data = localStorage.getItem("crm_agents");
    const parsedData = data ? JSON.parse(data) : AGEND_NAMESNewFormat;
    
    // Create a map to store agents by role
    const agentsByRole: Record<string, any[]> = {};
    
    // Group agents by their roles
    parsedData?.forEach((agent: any) => {
      const role = agent.role || "Other";
      if (!agentsByRole[role]) {
        agentsByRole[role] = [];
      }
      agentsByRole[role].push(agent);
    });
    
    // Create tree structure with roles as parent nodes and agents as children
    const treeData = ROLES.map((role: string) => {
      // Skip roles with no agents
      if (!agentsByRole[role] || agentsByRole[role].length === 0) {
        return null;
      }
      
      return {
        label: role,
        value: `role-${role}`,
        children: agentsByRole[role].map((agent: any) => ({
          label: agent.name,
          value: agent._id,
        })),
      };
    }).filter(Boolean); // Remove null entries for roles with no agents
    
    // Add any agents with roles not in the predefined ROLES list
    Object.keys(agentsByRole).forEach(role => {
      if (!ROLES.includes(role) && role !== "Other") {
        treeData.push({
          label: role,
          value: `role-${role}`,
          children: agentsByRole[role].map((agent: any) => ({
            label: agent.name,
            value: agent._id,
          })),
        });
      }
    });
    
    // Add agents with no role to "Other" category
    if (agentsByRole["Other"] && agentsByRole["Other"].length > 0) {
      treeData.push({
        label: "Other",
        value: "role-Other",
        children: agentsByRole["Other"].map((agent: any) => ({
          label: agent.name,
          value: agent._id,
        })),
      });
    }
    
    return treeData;
  } catch (error) {
    console.error("Error creating tree structure from agents data:", error);
    toast.error("Error processing agents data");
    return [];
  }
};

export const getStoredProductsServices = (forSelectOptions = false): any[] => {
  try {
    const data = localStorage.getItem("crm_products_services");
    const parsedData = data ? JSON.parse(data) : serviceOptionsNewFormat;
    const transformedData = parsedData?.map((item: any) => ({
      value: item._id,
      label: item.name,
    }));
    if (!forSelectOptions) {
      return data ? JSON.parse(data) : [];
    } else {
      return transformedData;
    }
  } catch (error) {
    console.error("Error parsing products services data:", error);
    return [];
  }
};

export const getStoredCountries = (forSelectOptions = false): any[] => {
  try {
    const data = localStorage.getItem("crm_countries");
    const parsedData = data ? JSON.parse(data) : countryOptions;
    const transformedData = parsedData?.map((item: any) => ({
      value: item.isoCode,
      label: item.name,
    }));
    if (!forSelectOptions) {
      return data ? JSON.parse(data) : [];
    } else {
      return transformedData;
    }
  } catch (error) {
    console.error("Error parsing countries data:", error);
    return [];
  }
};

export const getStoredNotification = (forSelectOptions = false): any[] => {
  try {
    const data = localStorage.getItem("crm_notifictaion");
    const parsedData = data ? JSON.parse(data) : [];
    return parsedData;
  } catch (error) {
    console.error("Error parsing countries data:", error);
    return [];
  }
};

export const getUserRole = (): string | null => {
  try {
    const data = localStorage.getItem("user");
    const parsedData = data ? JSON.parse(data) : [];
    if (parsedData?.role) {
      return parsedData?.role;
    }
    return null;
  } catch (error) {
    console.error("Error parsing countries data:", error);
    return null;
  }
};

// Helper function to clear all stored general data
export const clearGeneralData = (): void => {
  localStorage.removeItem("crm_status");
  localStorage.removeItem("crm_sources");
  localStorage.removeItem("crm_agents");
  localStorage.removeItem("crm_products_services");
  localStorage.removeItem("crm_countries");
};
