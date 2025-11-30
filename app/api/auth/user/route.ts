import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUser } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json(null, { status: 401 });
  }
  
  const user = await getUser(session.userId);
  
  if (!user) {
    return NextResponse.json(null, { status: 401 });
  }
  
  return NextResponse.json(user);
}
