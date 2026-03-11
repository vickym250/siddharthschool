import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "./firebase"
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey: "BHlsbE4KPaFkkGFsQBaDyy2OnUQsNsK5XRlJgjuLOMwGTe2sVd7bijlOqeR9BW2WYEmulDRHHsL4jjIcPGFhU2I" // Firebase Console -> Project Settings -> Cloud Messaging se milega
      });
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        return currentToken;
      }
    } else {
      console.log("Permission denied");
    }
  } catch (error) {
    console.log("An error occurred while retrieving token. ", error);
  }
};