import type { AlbumEvent, AlbumYear, FamilyMember } from "./types";
import { windowError } from "./years";

export const WIZARD_STEPS = ["People", "Years", "Happenings", "Mood", "Create"] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];
export const CREATE_STEP = 4;

export type StepHelp = {
  title: string;
  body: string;
};

export const STEP_HELP: StepHelp[] = [
  {
    title: "Who’s in the album",
    body: "Faces work better than group shots. You can add up to six people, five pictures each, and a short note about who they are in a room.",
  },
  {
    title: "The years we pretend",
    body: "Pick a window of 5 to 60 years. The pictures use the real look of those years — wool, Kodachrome, orbital trams — and the same people get older as the pages turn. 500 BC, 1948, and 2112 all work.",
  },
  {
    title: "What happened, or should have",
    body: "Optional. Up to ten events — a trip, a conquest, a Tuesday. Name it and say what it was. We weave them into the twenty pages. You can skip this and still make an album.",
  },
  {
    title: "The mood",
    body: "Optional. Up to three tags that lean on the whole album — funny, candid, travel, quiet. If you skip this, we treat it as candid.",
  },
  {
    title: "Ready to create",
    body: "The digital album is $12. Order a printed book with it and you get 30 credits to retake photographs with your own prompt. The same book later costs 5% more and comes with 10 credits. You can add a second album for $3 more. Hoodies wait on the finished album.",
  },
];

export function peopleProblem(members: FamilyMember[]): string | null {
  if (members.length === 0) return "Add at least one person.";
  if (members.some((member) => !member.name.trim())) {
    return "Every person needs a name.";
  }
  if (members.some((member) => member.photos.length === 0)) {
    return "Every person needs at least one photograph.";
  }
  return null;
}

export function firstIncompleteStep(
  members: FamilyMember[],
  start: AlbumYear,
  end: AlbumYear
): number | null {
  if (peopleProblem(members)) return 0;
  if (windowError(start, end)) return 1;
  return null;
}

export function draftIsReady(
  members: FamilyMember[],
  start: AlbumYear,
  end: AlbumYear
): boolean {
  return firstIncompleteStep(members, start, end) === null;
}

export function namedEvents(events: AlbumEvent[]): AlbumEvent[] {
  return events.filter((event) => event.name.trim());
}
