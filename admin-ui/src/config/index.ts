import type { MarkitConfig } from "types/markit";

export const config: MarkitConfig = {
  apiUrlBase: process.env.NEXT_PUBLIC_API_URL_BASE || "http://localhost:3000",
  apiBearerToken:
    process.env.NEXT_BEARER_TOKEN || "46294A404E635266556A576E5A723475",
  welcomeMessage:
    process.env.WELCOME_MESSAGE ||
    "Welcome to Mark-It Provisioner, the administrator interface for Mark-It, the system for accessible remote ballot marking for absentee voting.",
};
