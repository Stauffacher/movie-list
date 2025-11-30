import { NextRequest, NextResponse } from "next/server";
import { getOidcClient, client } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const config = await getOidcClient();
  const session = await getSession();
  
  const hostname = request.headers.get("host") || "";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const callbackUrl = `${protocol}://${hostname}/api/callback`;
  
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  
  session.codeVerifier = codeVerifier;
  session.state = state;
  await session.save();
  
  const authUrl = client.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: "openid email profile offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    prompt: "login consent",
  });
  
  return NextResponse.redirect(authUrl.href);
}
