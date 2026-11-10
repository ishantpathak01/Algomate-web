import { platformApi } from "@/lib/api/endpoints";

export const listConversations = platformApi.chat.conversations;
export const listMessages = platformApi.chat.messages;
export const sendMessage = platformApi.chat.send;
