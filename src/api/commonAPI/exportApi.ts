import { toast } from "react-toastify";
import { API } from "../../api";

interface ExportResponse {
  error: boolean;
  message: string;
  data: {
    fileData: string;
    fileName: string;
    contentType: string;
  };
}

async function downloadFile(response: any) {
  try {
    const { fileData, contentType, fileName } = response.data;
    
    // Convert base64 to blob
    const base64Response = await fetch(`data:${contentType};base64,${fileData}`);
    const blob = await base64Response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
}

export async function handleExportPDF(advancedFilters: any) {
  try {    
    const response = await API.getAuthAPI(
      'export-pdf',
      true,
      advancedFilters
    );

    if (response.error) {
      throw new Error(response.error);
    }

    const success = await downloadFile(response);
    
    if (success) {
      toast.success(response.message || 'PDF exported successfully');
    } else {
      throw new Error('Failed to download PDF');
    }
  } catch (error: any) {
    console.error('PDF export error:', error);
  }
}

export async function handleExportExcel(advancedFilters: any) {
  try {
    const response = await API.getAuthAPI(
      'export-excel',
      true,
      advancedFilters
    );

    if (response.error) {
      throw new Error(response.error);
    }

    const success = await downloadFile(response);
    
    if (success) {
      toast.success(response.message || 'Excel file exported successfully');
    } else {
      throw new Error('Failed to download Excel file');
    }
  } catch (error: any) {
    console.error('Excel export error:', error);
  }
}