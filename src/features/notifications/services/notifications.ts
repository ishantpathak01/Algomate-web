import { platformApi } from "@/lib/api/endpoints";

export const listNotifications = platformApi.notifications.list;
export const markNotificationRead = platformApi.notifications.markRead;
