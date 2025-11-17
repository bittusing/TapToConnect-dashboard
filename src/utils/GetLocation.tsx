import { useState } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

const GetLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const getLocation = () => {
    setLoading(true);
    setError('');

    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
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
      }
    );
  };

  const getGoogleMapsUrl = (latitude: number, longitude: number) => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  return (
    <div className="p-4">
      <button
        onClick={getLocation}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Getting Location...' : 'Get Current Location'}
      </button>

      {error && (
        <div className="mt-4 text-red-500">
          Error: {error}
        </div>
      )}

      {location && (
        <div className="mt-4 space-y-2">
          <h3 className="font-bold">Your Location:</h3>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
          <a
            href={getGoogleMapsUrl(location.latitude, location.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            View on Google Maps
          </a>
        </div>
      )}
    </div>
  );
};

export default GetLocation;