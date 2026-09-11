import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { storeBinary } from "./store";
import type { Album, AlbumPage } from "./types";
import { formatWindow } from "./years";

const SIZE = 595;
const MARGIN = 36;
const INK = rgb(0.11, 0.09, 0.08);
const MUTED = rgb(0.42, 0.39, 0.35);
const PAPER = rgb(0.96, 0.94, 0.9);
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

async function embedPhoto(pdf: PDFDocument, url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const png = bytes[0] === 0x89 && bytes[1] === 0x50;
  const jpg = bytes[0] === 0xff && bytes[1] === 0xd8;
  if (png) return pdf.embedPng(bytes);
  if (jpg) return pdf.embedJpg(bytes);
  throw new Error("Unsupported photograph format");
}

function albumTitle(album: Album): string {
  const names = album.members.map((member) => member.name).filter(Boolean);
  if (names.length === 0) return "Untitled album";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `The ${names[0]} household`;
}

function paintPaper(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: SIZE, height: SIZE, color: PAPER });
}

async function drawPhotoPage(pdf: PDFDocument, page: PDFPage, leaf: AlbumPage, font: PDFFont, bold: PDFFont) {
  paintPaper(page);
  page.drawText(String(leaf.index).padStart(2, "0"), {
    x: SIZE - MARGIN - 22,
    y: SIZE - 40,
    size: 10,
    font,
    color: MUTED,
  });
  const heading = wrap(bold, leaf.heading, 18, SIZE - MARGIN * 2 - 36);
  let y = SIZE - 52;
  for (const line of heading.slice(0, 2)) {
    page.drawText(line, { x: MARGIN, y, size: 18, font: bold, color: INK });
    y -= 22;
  }

  const photos = leaf.photos.filter((photo) => photo.imageUrl);
  const count = Math.max(photos.length, 1);
  const gap = 12;
  const cols = count <= 1 ? 1 : 2;
  const rows = Math.ceil(count / cols);
  const boxW = (SIZE - MARGIN * 2 - gap * (cols - 1)) / cols;
  const boxH = Math.min(boxW, (y - MARGIN - 28 - gap * (rows - 1)) / rows);

  for (const [i, photo] of photos.entries()) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = MARGIN + col * (boxW + gap);
    const top = y - 10 - row * (boxH + gap);
    if (photo.imageUrl) {
      try {
        const image = await embedPhoto(pdf, photo.imageUrl);
        const fitted = image.scaleToFit(boxW, boxH - 18);
        page.drawImage(image, {
          x: x + (boxW - fitted.width) / 2,
          y: top - fitted.height,
          width: fitted.width,
          height: fitted.height,
        });
      } catch {
        page.drawRectangle({ x, y: top - boxH, width: boxW, height: boxH, color: rgb(0.88, 0.85, 0.8) });
      }
    }
    page.drawText(ascii(`${photo.title}  ·  ${photo.yearLabel}`).slice(0, 60), {
      x,
      y: top - boxH + 4,
      size: 8,
      font,
      color: MUTED,
    });
  }
}

export async function buildPrintFiles(album: Album): Promise<{ interior: Uint8Array; cover: Uint8Array }> {
  const title = albumTitle(album);
  const interior = await PDFDocument.create();
  const coverDoc = await PDFDocument.create();
  const font = await interior.embedFont(StandardFonts.Helvetica);
  const bold = await interior.embedFont(StandardFonts.HelveticaBold);
  const coverBold = await coverDoc.embedFont(StandardFonts.HelveticaBold);

  const titlePage = interior.addPage([SIZE, SIZE]);
  paintPaper(titlePage);
  titlePage.drawText("WHENEVER", { x: MARGIN, y: SIZE - 64, size: 11, font: bold, color: ACCENT });
  let y = SIZE - 160;
  for (const line of wrap(bold, title, 32, SIZE - MARGIN * 2).slice(0, 3)) {
    titlePage.drawText(line, { x: MARGIN, y, size: 32, font: bold, color: INK });
    y -= 38;
  }
  titlePage.drawText(ascii(formatWindow(album.start, album.end)), {
    x: MARGIN,
    y: y - 8,
    size: 14,
    font,
    color: MUTED,
  });

  const roster = interior.addPage([SIZE, SIZE]);
  paintPaper(roster);
  roster.drawText("The people", { x: MARGIN, y: SIZE - 64, size: 22, font: bold, color: INK });
  let rosterY = SIZE - 110;
  for (const member of album.members) {
    roster.drawText(ascii(member.name), { x: MARGIN, y: rosterY, size: 16, font: bold, color: INK });
    rosterY -= 20;
    for (const line of wrap(font, member.description || "In the pictures.", 11, SIZE - MARGIN * 2).slice(0, 3)) {
      roster.drawText(line, { x: MARGIN, y: rosterY, size: 11, font, color: MUTED });
      rosterY -= 15;
    }
    rosterY -= 14;
  }

  for (const leaf of album.pages) {
    await drawPhotoPage(interior, interior.addPage([SIZE, SIZE]), leaf, font, bold);
  }

  const events = interior.addPage([SIZE, SIZE]);
  paintPaper(events);
  events.drawText("The years", { x: MARGIN, y: SIZE - 64, size: 22, font: bold, color: INK });
  events.drawText(ascii(formatWindow(album.start, album.end)), {
    x: MARGIN,
    y: SIZE - 96,
    size: 13,
    font,
    color: MUTED,
  });
  let eventY = SIZE - 140;
  const named = album.events.filter((event) => event.name.trim());
  if (named.length === 0) {
    events.drawText("Ordinary years, kept.", { x: MARGIN, y: eventY, size: 12, font, color: MUTED });
  } else {
    for (const event of named) {
      events.drawText(ascii(event.name), { x: MARGIN, y: eventY, size: 14, font: bold, color: INK });
      eventY -= 18;
      for (const line of wrap(font, event.description || "", 11, SIZE - MARGIN * 2).slice(0, 2)) {
        events.drawText(line, { x: MARGIN, y: eventY, size: 11, font, color: MUTED });
        eventY -= 14;
      }
      eventY -= 12;
    }
  }

  const colophon = interior.addPage([SIZE, SIZE]);
  paintPaper(colophon);
  colophon.drawText("Made on Whenever", { x: MARGIN, y: SIZE / 2 + 20, size: 18, font: bold, color: INK });
  colophon.drawText("A family album for any century.", {
    x: MARGIN,
    y: SIZE / 2 - 8,
    size: 12,
    font,
    color: MUTED,
  });

  const cover = coverDoc.addPage([SIZE, SIZE]);
  paintPaper(cover);
  const first = album.pages.flatMap((page) => page.photos).find((photo) => photo.imageUrl);
  if (first?.imageUrl) {
    try {
      const image = await embedPhoto(coverDoc, first.imageUrl);
      const fitted = image.scaleToFit(SIZE, SIZE);
      cover.drawImage(image, {
        x: (SIZE - fitted.width) / 2,
        y: (SIZE - fitted.height) / 2,
        width: fitted.width,
        height: fitted.height,
      });
      cover.drawRectangle({ x: 0, y: 0, width: SIZE, height: 110, color: PAPER });
    } catch {
      // title only
    }
  }
  cover.drawText("WHENEVER", { x: MARGIN, y: 72, size: 10, font: coverBold, color: ACCENT });
  cover.drawText(ascii(title).slice(0, 42), { x: MARGIN, y: 44, size: 18, font: coverBold, color: INK });

  interior.setTitle(ascii(title));
  coverDoc.setTitle(ascii(`${title} cover`));
  return { interior: await interior.save(), cover: await coverDoc.save() };
}

export async function storePrintFiles(album: Album): Promise<{ interiorUrl: string; coverUrl: string }> {
  const files = await buildPrintFiles(album);
  const interior = await storeBinary(
    `albums/${album.id}/print/interior.pdf`,
    Buffer.from(files.interior),
    "application/pdf"
  );
  const cover = await storeBinary(
    `albums/${album.id}/print/cover.pdf`,
    Buffer.from(files.cover),
    "application/pdf"
  );
  return { interiorUrl: interior.url, coverUrl: cover.url };
}
