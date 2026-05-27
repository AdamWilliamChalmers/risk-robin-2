import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleRobinSummary } from "../server/aiHandlers";
import { runHandler } from "./_lib";

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runHandler(handleRobinSummary, req, res, "/api/robin-summary");
}
