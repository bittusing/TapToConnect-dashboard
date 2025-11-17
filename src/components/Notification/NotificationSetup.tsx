import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { toast } from "react-toastify";
import ConfirmationModal from "../Modals/ConfirmationModal";
import { API } from "../../api";

const firebaseConfig = {
  apiKey: "AIzaSyCozUySs4wmujXlY_NZl8MKkIu8rZkpgic",
  authDomain: "connectcrm-b29a2.firebaseapp.com",
  projectId: "connectcrm-b29a2",
  storageBucket: "connectcrm-b29a2.firebasestorage.app",
  messagingSenderId: "690967737660",
  appId: "1:690967737660:web:d542a11843a7241c9d5a39",
  measurementId: "G-G3NC1QYNWK",
};

const VAPID_KEY =
  "BN-ecD8jPYjlkB9SssiGilOEiqwdTsBE7vt2MfmJOz9aq2puY20gHpTed_9-DHJA4UECAOcE72Yn63SilnVupvY";

const NotificationSetup: React.FC = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        await initializeFirebaseMessaging();
      } else {
        toast.error("Notifications are disabled");
      }
    } catch (err) {
      toast.error("Failed to request notification permission");
    }
  };

  const initializeFirebaseMessaging = async () => {
    try {
      if (!(await isSupported())) {
        throw new Error("Firebase Messaging is not supported in this browser.");
      }

      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker is not supported in this browser.");
      }

      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);
      const serviceWorkerRegistration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration,
      });

      if (!token) {
        throw new Error("Failed to retrieve FCM Token.");
      }

      if (localStorage.getItem("fcmWebToken") === token) {
        return;
      }
      // Update token in backend
      try {
        const { error, message } = await API.PutAuthAPI(
          { fcmWebToken: token },
          null,
          "update-token",
          true
        );

        if (error) {
          throw new Error(error);
        }

        localStorage.setItem("fcmWebToken", token);
      } catch (error) {
        console.error("Failed to update FCM token:", error);
      }

      onMessage(messaging, (payload) => {
        if (payload.notification) {
          new Notification(
            payload.notification.title || "Connect CRM Notification",
            {
              body: payload.notification.body || "",
              icon: payload.notification.icon || "/codersadda_logo_rect.png",
              badge: "/codersadda_logo_rect.png",
            }
          );
        }
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  useEffect(() => {
    const checkPermission = async () => {
      const permission = Notification.permission;
      if (permission === "default") {
        setShowConfirmation(true);
      } else if (permission === "granted") {
        await initializeFirebaseMessaging();
      }
    };

    checkPermission();
  }, []);

  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          setShowConfirmation(false);
          requestNotificationPermission();
        }}
        type="info"
        title="Enable Notifications"
        message="Would you like to receive notifications to stay updated with the latest updates?"
        confirmLabel="Enable"
        cancelLabel="Not Now"
      />
    </>
  );
};

export default NotificationSetup;
