import { NextRequest } from "next/server";
import { handleLogin } from "@/lib/login-route";

export async function POST(req: NextRequest) {
  return handleLogin(req, "admin");
}
