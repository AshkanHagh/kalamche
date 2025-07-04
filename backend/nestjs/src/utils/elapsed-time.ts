export type ElapsedTimeUnite =
  | "milliseconds"
  | "seconds"
  | "minutes"
  | "hours"
  | "days";

// get elapsed time from created at
export function getElapsedTime(createdAt: Date, unit: ElapsedTimeUnite) {
  const now = Date.now();
  const diffMs = now - createdAt.getTime();

  switch (unit) {
    case "milliseconds": {
      return diffMs;
    }
    case "seconds": {
      return diffMs / 1000;
    }
    case "minutes": {
      return diffMs / (1000 * 60);
    }
    case "hours": {
      return diffMs / (1000 * 60 * 60);
    }
    case "days": {
      return diffMs / (1000 * 60 * 60 * 24);
    }
  }
}
