import OpenAI from "openai";

let client: OpenAI | null = null;

export function openaiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY?.trim();
}

export function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) throw new Error("OPENAI_API_KEY is missing");
  if (!client) client = new OpenAI({ apiKey: key });
  return client;
}

export function imageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
}
