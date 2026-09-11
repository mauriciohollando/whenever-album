import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { AlbumPage, PublicAlbum } from "./types";
import { formatWindow } from "./years";

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const INK = rgb(0.11, 0.09, 0.08);
const MUTED = rgb(0.42, 0.39, 0.35);
const PAPER = rgb(0.95, 0.93, 0.9);
const ACCENT = rgb(0.76, 0.27, 0.12);

function ascii(value: string): string {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ");
}

function wrap(font: PDFFont, text: string, size: number, width: number): string[] {
  const words = ascii(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function bytesFromUrl(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

function isPng(bytes: Uint8Array): boolean {
  return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
}

function isJpeg(bytes: Uint8Array): boolean {
  return bytes[0] === 0xff && bytes[1] === 0xd8;
}

async function rasterizeToJpeg(url: string): Promise<Uint8Array> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || 1024;
  canvas.height = image.naturalHeight || 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not draw photograph");
  ctx.drawImage(image, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("Could not encode photograph"))),
      "image/jpeg",
      0.88
    );
  });
  return new Uint8Array(await blob.arrayBuffer());
}

async function embedPhoto(pdf: PDFDocument, url: string) {
  try {
    const bytes = await bytesFromUrl(url);
    if (isPng(bytes)) return pdf.embedPng(bytes);
    if (isJpeg(bytes)) return pdf.embedJpg(bytes);
  } catch {
    // fall through to canvas
  }
  return pdf.embedJpg(await rasterizeToJpeg(url));
}

function drawCover(
  page: PDFPage,
  album: PublicAlbum,
  title: string,
  font: PDFFont,
  bold: PDFFont
) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: PAPER });
  page.drawText("WHENEVER", {
    x: MARGIN,
    y: PAGE_H - 72,
    size: 11,
    font: bold,
    color: ACCENT,
  });
  const titleLines = wrap(bold, title, 28, PAGE_W - MARGIN * 2);
  let y = PAGE_H - 160;
  for (const line of titleLines) {
    page.drawText(line, { x: MARGIN, y, size: 28, font: bold, color: INK });
    y -= 34;
  }
  page.drawText(ascii(formatWindow(album.start, album.end)), {
    x: MARGIN,
    y: y - 8,
    size: 14,
    font,
    color: MUTED,
  });
  if (album.tags.length) {
    page.drawText(ascii(album.tags.join("  /  ")), {
      x: MARGIN,
      y: 80,
      size: 11,
      font,
      color: MUTED,
    });
  }
}

function photoSlots(count: number): Array<{ x: number; y: number; w: number; h: number }> {
  const inner = PAGE_W - MARGIN * 2;
  const top = 560;
  if (count <= 1) {
    return [{ x: MARGIN + inner * 0.12, y: 210, w: inner * 0.76, h: 380 }];
  }
  if (count === 2) {
    const w = (inner - 16) / 2;
    return [
      { x: MARGIN, y: 250, w, h: w },
      { x: MARGIN + w + 16, y: 250, w, h: w },
    ];
  }
  const w = (inner - 16) / 2;
  const h = 200;
  return Array.from({ length: Math.min(count, 4) }, (_, i) => ({
    x: MARGIN + (i % 2) * (w + 16),
    y: top - Math.floor(i / 2) * (h + 56),
    w,
    h,
  }));
}

async function drawAlbumPage(
  pdf: PDFDocument,
  page: PDFPage,
  leaf: AlbumPage,
  font: PDFFont,
  bold: PDFFont
) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: PAPER });
  page.drawText(String(leaf.index).padStart(2, "0"), {
    x: PAGE_W - MARGIN - 24,
    y: PAGE_H - 56,
    size: 11,
    font,
    color: MUTED,
  });
  const heading = wrap(bold, leaf.heading, 20, PAGE_W - MARGIN * 2 - 40);
  let y = PAGE_H - 72;
  for (const line of heading.slice(0, 2)) {
    page.drawText(line, { x: MARGIN, y, size: 20, font: bold, color: INK });
    y -= 24;
  }

  const slots = photoSlots(leaf.photos.length);
  for (const [i, photo] of leaf.photos.entries()) {
    const slot = slots[i];
    if (!slot) continue;
    if (photo.imageUrl) {
      try {
        const image = await embedPhoto(pdf, photo.imageUrl);
        const size = image.scaleToFit(slot.w, slot.h);
        const x = slot.x + (slot.w - size.width) / 2;
        const yImg = slot.y + (slot.h - size.height) / 2;
        page.drawImage(image, { x, y: yImg, width: size.width, height: size.height });
      } catch {
        page.drawRectangle({
          x: slot.x,
          y: slot.y,
          width: slot.w,
          height: slot.h,
          color: rgb(0.88, 0.85, 0.8),
        });
      }
    }
    const caption = wrap(font, `${photo.title}  ·  ${photo.yearLabel}`, 9, slot.w);
    page.drawText(caption[0] || "", {
      x: slot.x,
      y: slot.y - 16,
      size: 9,
      font,
      color: MUTED,
    });
  }
}

export function albumPdfFilename(title: string): string {
  const slug = ascii(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `whenever-${slug || "album"}.pdf`;
}

export async function buildAlbumPdf(album: PublicAlbum, title: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const cover = pdf.addPage([PAGE_W, PAGE_H]);
  drawCover(cover, album, title, font, bold);

  for (const leaf of album.pages) {
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    await drawAlbumPage(pdf, page, leaf, font, bold);
  }

  pdf.setTitle(ascii(title));
  pdf.setAuthor("Whenever");
  return pdf.save();
}

export async function downloadAlbumPdf(album: PublicAlbum, title: string): Promise<void> {
  const bytes = await buildAlbumPdf(album, title);
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = albumPdfFilename(title);
  link.click();
  URL.revokeObjectURL(url);
}
