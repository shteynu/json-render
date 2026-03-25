import type { NextAppSpec } from "@json-render/next";
import { defaultSpec } from "@/lib/default-spec";

let currentSpec: NextAppSpec = defaultSpec;

export async function GET() {
  return Response.json(currentSpec);
}

export async function PUT(req: Request) {
  currentSpec = (await req.json()) as NextAppSpec;
  return Response.json({ ok: true });
}
