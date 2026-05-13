import type { Presentation } from "@/types/presentation";

// Check if presentation is accessible (status === "ACTIVE" and expiresAt > now).
export function isPresentationAccessible(presentation: Presentation): boolean {
  return (
    presentation.status === "ACTIVE" &&
    presentation.expiresAt.getTime() > Date.now()
  );
}
