import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handlePersonaNames } from "../server/aiHandlers.js";
import { runHandler } from "./_lib.js";

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runHandler(handlePersonaNames, req, res, "/api/persona-names");
}
