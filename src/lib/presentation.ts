import type { Presentation } from "@/types/presentation";

// Check if presentation is accessible (status === "active" and expiresAt > now).
export function isPresentationAccessible(presentation: Presentation): boolean {
  return (
    presentation.status === "active" &&
    presentation.expiresAt.getTime() > Date.now()
  );
}
