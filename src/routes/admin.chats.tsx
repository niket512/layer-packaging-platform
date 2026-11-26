import { createFileRoute } from "@tanstack/react-router";
import AdminChats from "@/pages/AdminChats";

export const Route = createFileRoute("/admin/chats")({
  component: AdminChats,
});
