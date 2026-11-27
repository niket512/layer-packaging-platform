import { createFileRoute } from "@tanstack/react-router";
import AdminChats from "@/pages/AdminChats";

export const Route = createFileRoute("/app/admin/chats")({
  head: () => ({ meta: [
    { title: "Marketplace Chat Reports | Snaplogo" },
    { name: "description", content: "Private conversation inbox, visitor journeys and enquiry funnels for Snaplogo administrators." },
    { property: "og:title", content: "Marketplace Chat Reports | Snaplogo" },
    { property: "og:description", content: "Private Snaplogo conversation and visitor activity reports." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AdminChats,
});
