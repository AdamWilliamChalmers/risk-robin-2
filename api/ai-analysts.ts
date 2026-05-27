import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleAnalysts } from "../server/aiHandlers.js";
import { runHandler } from "./_lib.js";

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runHandler(handleAnalysts, req, res, "/api/ai-analysts");
}
