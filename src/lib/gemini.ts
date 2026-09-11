import { GoogleGenAI, Modality } from "@google/genai";

let client: GoogleGenAI | null = null;

export function geminiConfigured(): boolean {
  return !!(
    process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim()
  );
}

export function getGemini(): GoogleGenAI {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

/** Nano Banana. Override with GEMINI_IMAGE_MODEL for Nano Banana Pro. */
export function geminiImageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || "gemini-2.5-flash-image";
}

export async function generateGeminiPhotograph(
  prompt: string,
  referenceUrls: string[] = []
): Promise<Buffer> {
  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [
    {
      text: `${prompt}

Use any attached reference photographs only as identity. Keep a strong likeness — same faces, bone structure, and coloring — then age or youth them as the year requires. Return one finished photograph and nothing else.`,
    },
  ];

  for (const [i, url] of referenceUrls.slice(0, 4).entries()) {
    const res = await fetch(url);
    if (!res.ok) continue;
    const mime = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
    if (!mime.startsWith("image/")) continue;
    parts.push({
      inlineData: {
        mimeType: mime,
        data: Buffer.from(await res.arrayBuffer()).toString("base64"),
      },
    });
    if (i === 0) {
      parts.push({
        text: "The attached photographs are the family. Match them.",
      });
    }
  }

  const response = await getGemini().models.generateContent({
    model: geminiImageModel(),
    contents: [{ role: "user", parts }],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const inline = response.data;
  if (inline) return Buffer.from(inline, "base64");

  const partsOut = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of partsOut) {
    const data = part.inlineData?.data;
    if (data) return Buffer.from(data, "base64");
  }

  const text = response.text?.slice(0, 240);
  throw new Error(text || "Nano Banana returned no photograph");
}
