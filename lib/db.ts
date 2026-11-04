import fs from "node:fs";
import path from "node:path";
import type { DB, Post, User } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function seed(): DB {
  const now = Date.now();
  const ago = (minutes: number) => new Date(now - minutes * 60_000).toISOString();

  const person = (
    id: string,
    handle: string,
    name: string,
    bio: string,
    color: string,
  ): User => ({ id, handle, name, bio, color, joinedAt: ago(60 * 24 * 400) });

  const users = [
    person("u1", "you", "Demo User", "Trying out this little app.", "#2563eb"),
    person("u2", "ada_codes", "Ada Moreno", "Backend engineer. Tea over coffee, always.", "#7c3aed"),
    person("u3", "trailmix", "Sam Okafor", "Weekend hiker and weekday spreadsheet wrangler.", "#047857"),
    person("u4", "pixelpia", "Pia Lindqvist", "Product designer. I have opinions about padding.", "#be123c"),
    person("u5", "breadbylee", "Lee Tran", "Baking my way through every hydration ratio.", "#b45309"),
  ];

  const post = (
    id: string,
    authorId: string,
    text: string,
    minutes: number,
    extras: { replyToId?: string; likes?: string[]; reposts?: string[] } = {},
  ): Post => ({
    id,
    authorId,
    text,
    createdAt: ago(minutes),
    replyToId: extras.replyToId ?? null,
    likes: (extras.likes ?? []).map((userId, i) => ({ userId, at: ago(minutes - i - 1) })),
    reposts: (extras.reposts ?? []).map((userId, i) => ({ userId, at: ago(minutes - i - 2) })),
  });

  const posts = [
    post("p1", "u2", "Deleted 400 lines today and the tests still pass. Best kind of Tuesday. #programming", 12, {
      likes: ["u3", "u4", "u5"],
      reposts: ["u4"],
    }),
    post("p2", "u4", "Hot take: most interfaces don't need another modal. #design", 45, {
      likes: ["u2", "u1"],
    }),
    post("p3", "u3", "Made it to the ridge just before the fog rolled in. Worth the 5am alarm. #hiking", 130, {
      likes: ["u1", "u5"],
    }),
    post("p4", "u5", "Day 12 of the sourdough experiment: 78% hydration is officially too much for my patience. #baking", 220, {
      likes: ["u3"],
      reposts: ["u3"],
    }),
    post("p5", "u1", "Hello from my first post! Thanks @ada_codes for the nudge to join.", 300, {
      likes: ["u2"],
    }),
    post("p6", "u2", "Reminder that a boring database is a feature. #programming", 480, {
      likes: ["u1", "u4"],
    }),
    post("p7", "u4", "Spent the morning nudging a button 2px to the left. No regrets. #design", 900),
    post("p8", "u3", "Trail recommendations for a rainy weekend? Asking for my very muddy boots. #hiking", 1500, {
      likes: ["u5"],
    }),
    // Replies
    post("r1", "u3", "Which 400? Asking as someone with a 4,000 line file I'm scared of.", 10, {
      replyToId: "p1",
      likes: ["u2"],
    }),
    post("r2", "u2", "Start with the ones nobody has called since 2021.", 8, { replyToId: "r1" }),
    post("r3", "u1", "Fully agree. Inline editing wherever possible.", 30, { replyToId: "p2" }),
    post("r4", "u5", "Try a bit less water and a longer bulk ferment. Worked for me on a similar flour.", 3, {
      replyToId: "p8",
    }),
  ];

  const follows = [
    ["u1", "u2"],
    ["u1", "u3"],
    ["u2", "u1"],
    ["u2", "u4"],
    ["u3", "u1"],
    ["u3", "u5"],
    ["u4", "u2"],
    ["u5", "u3"],
  ].map(([followerId, followeeId]) => ({ followerId, followeeId, at: ago(60 * 24) }));

  return { users, posts, follows };
}

function save(db: DB) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  // Write then rename so a crash mid-write can't leave a half-written file.
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

export function readDb(): DB {
  if (!fs.existsSync(DB_FILE)) {
    const db = seed();
    save(db);
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
}

/**
 * Applies a change and saves it. Everything here is synchronous, so two
 * requests in the same Node process can't interleave and lose an update.
 */
export function mutateDb<T>(change: (db: DB) => T): T {
  const db = readDb();
  const result = change(db);
  save(db);
  return result;
}
