import { createFileRoute } from "@tanstack/react-router";
import AdminChats from "@/pages/AdminChats";

export const Route = createFileRoute("/admin/chats")({
  head: () => ({ meta: [
    { title: "Chats & Visitor Journeys | Snaplogo" },
    { name: "description", content: "Private conversation inbox, visitor journeys and enquiry funnels for Snaplogo administrators." },
    { property: "og:title", content: "Chats & Visitor Journeys | Snaplogo" },
    { property: "og:description", content: "Private Snaplogo conversation and visitor activity reports." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: AdminChats,
});
