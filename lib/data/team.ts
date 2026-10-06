/**
 * Non-text team data. Display copy (names, titles, bios, image alt text) lives in
 * messages/<locale>/about.json under `team`, keyed by `id`.
 */
export type TeamMemberId = "uditha" | "chathuranga" | "akla";
export type TeamBlockId = "udith" | "founders";

export interface TeamBlock {
  id: TeamBlockId;
  image: string;
  members: TeamMemberId[];
}

export const teamBlocks: TeamBlock[] = [
  { id: "udith", image: "/udith.png", members: ["uditha"] },
  { id: "founders", image: "/team.png", members: ["chathuranga", "akla"] },
];
