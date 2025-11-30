import { NextRequest, NextResponse } from "next/server";
import { getOidcClient, upsertUser, client } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const config = await getOidcClient();
  const session = await getSession();
  
  const codeVerifier = session.codeVerifier;
  const savedState = session.state;
  
  if (!codeVerifier || !savedState) {
    return NextResponse.redirect(new URL("/api/login", request.url));
  }
  
  try {
    const tokens = await client.authorizationCodeGrant(config, request.nextUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedState: savedState,
    });
    
    const claims = tokens.claims();
    if (!claims) {
      throw new Error("No claims in token");
    }
    
    await upsertUser({
      id: claims.sub,
      email: claims.email as string | undefined,
      firstName: claims.first_name as string | undefined,
      lastName: claims.last_name as string | undefined,
      profileImageUrl: claims.profile_image_url as string | undefined,
    });
    
    session.userId = claims.sub;
    session.accessToken = tokens.access_token;
    session.refreshToken = tokens.refresh_token;
    session.expiresAt = claims.exp;
    session.isLoggedIn = true;
    delete session.codeVerifier;
    delete session.state;
    await session.save();
    
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/api/login", request.url));
  }
}
