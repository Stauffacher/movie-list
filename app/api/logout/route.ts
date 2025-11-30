import { NextRequest, NextResponse } from "next/server";
import { getOidcClient, client } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const config = await getOidcClient();
  const session = await getSession();
  
  session.isLoggedIn = false;
  session.userId = undefined;
  session.accessToken = undefined;
  session.refreshToken = undefined;
  session.expiresAt = undefined;
  await session.save();
  
  const hostname = request.headers.get("host") || "";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  
  const logoutUrl = client.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: `${protocol}://${hostname}`,
  }).href;
  
  return NextResponse.redirect(logoutUrl);
}
