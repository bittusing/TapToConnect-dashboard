import { DeviceType } from "../types/deviceType";
import { useState, useEffect } from "react";

// Define the breakpoints for mobile and tablet
const MOBILE_BREAKPOINT = 545; // Common breakpoint for mobile screens
const TABLET_BREAKPOINT = 1024; // Common breakpoint for tablet screens

const useScreenHook = () => {
  // State to hold the screen width
  const [screenWidth, setScreenWidth] = useState<number>(window.innerWidth);
  // State to hold the device type
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  useEffect(() => {
    // Function to update the screen width and device type
    const updateScreenSize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        setDeviceType("mobile");
      } else if (window.innerWidth < TABLET_BREAKPOINT) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };

    // Initial update
    updateScreenSize();

    // Update on window resize
    window.addEventListener("resize", updateScreenSize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", updateScreenSize);
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return { screenWidth, deviceType };
};

export default useScreenHook;
