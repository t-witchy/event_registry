export type ProductArea = "puzzles" | "gameplay";

export type Source = "v1 Loosely typed" | "v2 Strongly typed";

export type Event = {
  id: number;
  name: string;
  canonicalName: string;
  renamedToName: string | null;
  description: string;
  tags: string[];
  productArea: ProductArea;
  source: Source;
};

export type NewEvent = Omit<Event, "id">;

let currentId = 5;

const events: Event[] = [
  {
    id: 1,
    name: "Daily Puzzle Completed",
    canonicalName: "daily_puzzle_completed",
    renamedToName: null,
    description:
      "Fires when a user successfully completes the daily puzzle challenge.",
    tags: ["engagement", "retention"],
    productArea: "puzzles",
    source: "v1 Loosely typed",
  },
  {
    id: 2,
    name: "Puzzle Hint Used",
    canonicalName: "puzzle_hint_used",
    renamedToName: null,
    description:
      "Tracks when a user consumes a hint while solving a puzzle, including puzzle and user identifiers.",
    tags: ["puzzles", "monetization"],
    productArea: "puzzles",
    source: "v2 Strongly typed",
  },
  {
    id: 3,
    name: "Game Started",
    canonicalName: "game_started",
    renamedToName: "game_session_started",
    description:
      "Recorded when a user starts a new game, including time control and game mode metadata.",
    tags: ["gameplay"],
    productArea: "gameplay",
    source: "v2 Strongly typed",
  },
  {
    id: 4,
    name: "Game Abandoned",
    canonicalName: "game_abandoned",
    renamedToName: null,
    description:
      "Emitted when a user leaves a game before completion, including resignation and disconnect reasons.",
    tags: ["quality", "fairplay"],
    productArea: "gameplay",
    source: "v1 Loosely typed",
  },
];

export function listEvents(): Event[] {
  return events;
}

export function createEvent(input: NewEvent): Event {
  const event: Event = {
    id: currentId++,
    ...input,
    renamedToName: input.renamedToName ?? null,
    tags: input.tags ?? [],
  };

  events.push(event);
  return event;
}

export function getEvent(id: number): Event | undefined {
  return events.find((event) => event.id === id);
}

export function updateEvent(id: number, input: NewEvent): Event | undefined {
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return undefined;

  const updated: Event = {
    id,
    ...input,
    renamedToName: input.renamedToName ?? null,
    tags: input.tags ?? [],
  };

  events[index] = updated;
  return updated;
}



