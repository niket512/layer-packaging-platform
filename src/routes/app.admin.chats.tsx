import { createFileRoute } from "@tanstack/react-router";
import AdminChats from "@/pages/AdminChats";

export const Route = createFileRoute("/app/admin/chats")({
  component: AdminChats,
});
