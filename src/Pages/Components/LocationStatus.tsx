import { Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const LocationStatus = ({ 
  loading, 
  location, 
  error,
  onRetry 
}: { 
  loading: boolean;
  location: { latitude: number; longitude: number; } | null;
  error: string;
  onRetry: () => void;
}) => {
  if (loading) {
    return (
      <div className="flex w-full items-center justify-center gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <Spin size="small" />
        <span>Fetching your current location...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
        <span className="text-red-700 dark:text-red-400">{error}</span>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-md bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60"
        >
          <ReloadOutlined /> Retry
        </button>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex w-full items-center justify-center rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <span>Upload file to fetch your current location</span>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
      <span className="text-green-700 dark:text-green-400">
        Location: {location.latitude}, {location.longitude}
      </span>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-md bg-green-100 px-3 py-1 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400 dark:hover:bg-green-900/60"
      >
        <ReloadOutlined /> Refresh
      </button>
    </div>
  );
};

export default LocationStatus;