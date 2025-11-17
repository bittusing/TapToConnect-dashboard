import { useEffect, useState } from "react";
interface Location {
  latitude: number;
  longitude: number;
}

// interface GeolocationError {
//   message: string;
// }

const useGetLocation = ({
  getLocationToggle,
  setGetLocationToggle,
}: {
  getLocationToggle: boolean;
  setGetLocationToggle: any;
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const getLocation = () => {
    setLoading(true);
    setError("");

    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      // Error callback
      (error: GeolocationPositionError) => {
        setError(error.message);
        setLoading(false);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
    setGetLocationToggle(false);
  };

  useEffect(() => {
    if (!getLocationToggle) {
      setLocation(null);
      setError("");
      return;
    }
    getLocation();
  }, [getLocationToggle]);

  return { error, location, loading };
};

export default useGetLocation;
