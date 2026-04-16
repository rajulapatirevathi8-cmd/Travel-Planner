export interface BusSeat {
  id: string;
  label: string;
  row: number;
  col: string;
  berth?: "lower" | "upper";
  side: "left" | "right";
  status: "available" | "booked";
  gender?: "M" | "F";
}

export type BusLayoutType = "sleeper" | "seater";

export function getBusLayoutType(busType: string): BusLayoutType {
  const t = busType.toLowerCase();
  if (t.includes("sleeper") && !t.includes("semi")) return "sleeper";
  return "seater";
}

function nextSeed(s: number): number {
  return ((s * 1664525 + 1013904223) & 0x7fffffff);
}

function buildBookedFemale(
  busId: number,
  totalSeats: number,
  seatsAvailable: number,
): { booked: Set<number>; female: Set<number> } {
  const booked = new Set<number>();
  const toFill = totalSeats - seatsAvailable;
  let seed = busId * 7919;
  while (booked.size < toFill) {
    seed = nextSeed(seed);
    booked.add((seed % totalSeats) + 1);
  }
  const female = new Set<number>();
  seed = busId * 6271;
  for (const s of booked) {
    seed = nextSeed(seed);
    if (seed % 10 < 3) female.add(s);
  }
  return { booked, female };
}

export function generateBusSeats(
  busId: number,
  busType: string,
  totalSeats: number,
  seatsAvailable: number,
): BusSeat[] {
  const layout = getBusLayoutType(busType);
  const { booked, female } = buildBookedFemale(busId, totalSeats, seatsAvailable);
  const seats: BusSeat[] = [];
  let idx = 0;

  if (layout === "sleeper") {
    // 2+1 layout with upper/lower berths
    // Left side: cols A and B; Right side: col C
    // Per row: 6 berths (A-L, A-U, B-L, B-U, C-L, C-U)
    const rows = Math.ceil(totalSeats / 6);
    for (let row = 1; row <= rows; row++) {
      for (const col of ["A", "B"]) {
        for (const berth of ["lower", "upper"] as const) {
          if (idx >= totalSeats) continue;
          idx++;
          const suffix = berth === "lower" ? "L" : "U";
          seats.push({
            id: `${col}${row}${suffix}`,
            label: `${col}${row}`,
            row,
            col,
            berth,
            side: "left",
            status: booked.has(idx) ? "booked" : "available",
            gender: booked.has(idx) ? (female.has(idx) ? "F" : "M") : undefined,
          });
        }
      }
      for (const berth of ["lower", "upper"] as const) {
        if (idx >= totalSeats) continue;
        idx++;
        const suffix = berth === "lower" ? "L" : "U";
        seats.push({
          id: `C${row}${suffix}`,
          label: `C${row}`,
          row,
          col: "C",
          berth,
          side: "right",
          status: booked.has(idx) ? "booked" : "available",
          gender: booked.has(idx) ? (female.has(idx) ? "F" : "M") : undefined,
        });
      }
    }
  } else {
    // 2+2 seater layout: cols A, B (left) | C, D (right)
    const rows = Math.ceil(totalSeats / 4);
    for (let row = 1; row <= rows; row++) {
      for (const col of ["A", "B", "C", "D"]) {
        if (idx >= totalSeats) continue;
        idx++;
        seats.push({
          id: `${col}${row}`,
          label: `${col}${row}`,
          row,
          col,
          side: col === "A" || col === "B" ? "left" : "right",
          status: booked.has(idx) ? "booked" : "available",
          gender: booked.has(idx) ? (female.has(idx) ? "F" : "M") : undefined,
        });
      }
    }
  }

  return seats;
}
