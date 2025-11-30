import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  codeVerifier?: string;
  state?: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  isLoggedIn: boolean;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "netflix-tracker-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
