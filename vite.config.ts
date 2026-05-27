import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { aiPlugin } from "./server/aiPlugin";

export default defineConfig(({ mode }) => {
  // Read .env / .env.local (etc.) for server-side use only. The third arg ""
  // means "load all variables", not just VITE_-prefixed ones — we explicitly
  // do NOT want OPENAI_API_KEY exposed to the client bundle, and we don't
  // pass it into define() or import.meta.env.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(),
      aiPlugin({
        OPENAI_API_KEY: env.OPENAI_API_KEY,
        OPENAI_MODEL: env.OPENAI_MODEL,
      }),
    ],
    server: { port: 5173, host: true },
  };
});
