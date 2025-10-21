import { TicketStatus } from "@/types/TicketStatus";

export function normalizeStatus(s?: TicketStatus): {
  text: string;
  bg: string;
  fg: string;
} {
  switch (s) {
    case TicketStatus.Open:
      return { text: "Open", bg: "#FFF7E6", fg: "#9A6B00" };
    case TicketStatus.InProgress:
      return { text: "In progress", bg: "#EAF5FF", fg: "#0A5AA6" };
    case TicketStatus.Closed:
      return { text: "Closed", bg: "#EEF9F0", fg: "#1C7C3A" };
    default:
      return { text: "Unknown", bg: "#EEE", fg: "#555" };
  }
}
