import OpenAI from "openai";
import { config } from "../config.js";
import { IntentSchema } from "./intentSchema.js";

const client = new OpenAI({ apiKey: config.openai.apiKey });

export async function parseIntent(userText) {
  const prompt = `You are a strict parser.
Return ONLY valid JSON object with keys: action, parameters, requiresApproval, reason.
Never include shell command strings.
Allowed actions:
- CREATE_NEXTJS_APP
- INSTALL_DEPENDENCIES
- RUN_DEV_SERVER
- OPEN_CURSOR`;

  const completion = await client.chat.completions.create({
    model: config.openai.model,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: userText }
    ]
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw);
  return IntentSchema.parse(parsed);
}
