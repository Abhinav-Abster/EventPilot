import { describe, it, expect } from "vitest";
import { PriorityQueue } from "../lib/utils/priorityQueue";

describe("PriorityQueue", () => {
  it("initializes empty", () => {
    const pq = new PriorityQueue<number>((a, b) => a - b);
    expect(pq.size).toBe(0);
    expect(pq.isEmpty()).toBe(true);
    expect(pq.peek()).toBeUndefined();
    expect(pq.pop()).toBeUndefined();
  });

  it("extracts elements in sorted min order", () => {
    const pq = new PriorityQueue<number>((a, b) => a - b);
    const nums = [42, 10, 5, 100, 2, 8, 30];
    nums.forEach((n) => pq.push(n));

    expect(pq.size).toBe(7);
    expect(pq.isEmpty()).toBe(false);
    expect(pq.peek()).toBe(2);

    const sorted: number[] = [];
    while (!pq.isEmpty()) {
      sorted.push(pq.pop()!);
    }

    expect(sorted).toEqual([2, 5, 8, 10, 30, 42, 100]);
    expect(pq.size).toBe(0);
    expect(pq.isEmpty()).toBe(true);
  });

  it("handles string comparison (e.g. ISO date strings)", () => {
    const pq = new PriorityQueue<{ id: string; date: string }>((a, b) =>
      a.date.localeCompare(b.date)
    );

    pq.push({ id: "t3", date: "2026-11-20" });
    pq.push({ id: "t1", date: "2026-11-01" });
    pq.push({ id: "t2", date: "2026-11-10" });

    expect(pq.pop()?.id).toBe("t1");
    expect(pq.pop()?.id).toBe("t2");
    expect(pq.pop()?.id).toBe("t3");
  });

  it("maintains FIFO stability for equal priority elements", () => {
    const pq = new PriorityQueue<{ name: string; priority: number }>((a, b) =>
      a.priority - b.priority
    );

    pq.push({ name: "first-10", priority: 10 });
    pq.push({ name: "second-10", priority: 10 });
    pq.push({ name: "high-1", priority: 1 });
    pq.push({ name: "third-10", priority: 10 });

    expect(pq.pop()?.name).toBe("high-1");
    expect(pq.pop()?.name).toBe("first-10");
    expect(pq.pop()?.name).toBe("second-10");
    expect(pq.pop()?.name).toBe("third-10");
  });
});
