// src/services/usage.service.ts

import { ChatHistory } from "../Chatgpt/chat-history.model";

/** types (adjust import/exports to your project) */
type TokenUsagePoint = { date: string; msg: number };
export type TokenUsageResponse = {
  totalTokensAvailable: number;
  totalTokensUsed: number;
  range?: string;
  points: TokenUsagePoint[];
};

/** helper: format YYYY-MM-DD in UTC */
function formatDateUTC(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** helper: pad number to two digits */
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** get array of last N dates (inclusive of end), end is todayUTC or provided */
function getLastNDates(n: number, endDate = new Date()): string[] {
  const arr: string[] = [];
  const d = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  for (let i = n - 1; i >= 0; i--) {
    const current = new Date(d);
    current.setUTCDate(d.getUTCDate() - i);
    arr.push(formatDateUTC(current));
  }
  return arr;
}

/** get list of last N ISO-week strings "YYYY-Www" ending this week (inclusive) */
function getLastNWeeksISO(n: number, endDate = new Date()): string[] {
  function padWeek(n: number) {
    return String(n).padStart(2, "0");
  }
  function isoWeekAndYear(date: Date) {
    const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    // Thursday in current week decides the year.
    tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.floor(((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7) + 1;
    return { year: tmp.getUTCFullYear(), week: weekNo };
  }

  const weeks: string[] = [];
  const copy = new Date(endDate);
  for (let i = n - 1; i >= 0; i--) {
    const iter = new Date(copy);
    iter.setUTCDate(iter.getUTCDate() - i * 7);
    const wy = isoWeekAndYear(iter);
    weeks.push(`${wy.year}-W${padWeek(wy.week)}`);
  }
  return weeks;
}

/** --- month-week helpers: labels like "2025-08-w1" --- */

/** Build label like "2025-08-w1" from a Date (uses UTC) */
function monthWeekLabelFromDateUTC(d: Date): string {
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);
  const day = d.getUTCDate();
  const weekInMonth = Math.ceil(day / 7); // 1..5
  return `${year}-${month}-w${weekInMonth}`;
}

/**
 * Return an array of labels for the last N week-of-month windows (oldest -> newest).
 * Each label corresponds to the week starting at start + (i*7) days.
 */
function lastNMonthWeeks(n = 3, endDate = new Date()): string[] {
  const endUtc = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  const start = new Date(endUtc);
  // inclusive start: go back (n*7 - 1) days
  start.setUTCDate(start.getUTCDate() - (n * 7 - 1));
  const labels: string[] = [];
  for (let i = 0; i < n; i++) {
    const dt = new Date(start);
    dt.setUTCDate(start.getUTCDate() + i * 7);
    labels.push(monthWeekLabelFromDateUTC(dt));
  }
  return labels;
}

/**
 * Count assistant messages by shop in daily (last N days), weekly (ISO weeks) or month-week ("YYYY-MM-wN") format.
 *
 * range:
 *   - "daily" -> last `opts.days` days (default 7), points[].date = YYYY-MM-DD
 *   - "weekly" -> last `opts.weeks` ISO weeks (default 3), points[].date = YYYY-Www
 *   - "month-week" -> last `opts.weeks` week-of-month windows (default 3), points[].date = YYYY-MM-wN
 *
 * totalTokensAvailable: returned unchanged (for UI display); default 50000.
 */
export async function getMessageCountUsageByShop(
  shopId: string,
  range: "daily" | "weekly" | "month-week",
  opts?: { days?: number; weeks?: number; totalTokensAvailable?: number; startDate?: Date;endDate?: Date  }
): Promise<TokenUsageResponse> {
  if (!shopId) {
    return {
      totalTokensAvailable: opts?.totalTokensAvailable ?? 1000,
      totalTokensUsed: 0,
      range,
      points: []
    };
  }

  const totalTokensAvailable = opts?.totalTokensAvailable ?? 1000;

  const now = new Date();
  if (range === "daily") {
      const end = opts?.endDate ? new Date(opts.endDate) : now; // now
    const days = opts?.days ?? 7;
   const start = opts?.startDate
    ? new Date(opts.startDate)
    : new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
      if (!opts?.startDate) start.setUTCDate(start.getUTCDate() - (days - 1));
    // start.setUTCDate(start.getUTCDate() - (days - 1)); // inclusive start

    // aggregate messages by YYYY-MM-DD
    const agg = await ChatHistory.aggregate([
      { $match: { shopId } },
      { $unwind: "$messages" },
      {
        $match: {
          "messages.role": "assistant",
          "messages.createdAt": { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          dateStr: { $dateToString: { format: "%Y-%m-%d", date: "$messages.createdAt" } }
        }
      },
      { $group: { _id: "$dateStr", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).exec();

    const map: Record<string, number> = {};
    agg.forEach((r: any) => (map[r._id] = r.count));

    const dates = getLastNDates(days, end);
    const points = dates.map((d) => ({ date: d, msg: map[d] ?? 0 }));
    const totalTokensUsed = points.reduce((s, p) => s + p.msg, 0);

    return { totalTokensAvailable, totalTokensUsed, range, points };
  }

  if (range === "weekly") {
    const weeksCount = opts?.weeks ?? 3;
    const end = new Date();
    const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - (weeksCount * 7 - 1));

    // aggregate by ISO week/year
    const agg = await ChatHistory.aggregate([
      { $match: { shopId } },
      { $unwind: "$messages" },
      {
        $match: {
          "messages.role": "assistant",
          "messages.createdAt": { $gte: start, $lte: end }
        }
      },
      {
        $project: {
          isoWeek: { $isoWeek: "$messages.createdAt" },
          isoYear: { $isoWeekYear: "$messages.createdAt" }
        }
      },
      {
        $group: {
          _id: { year: "$isoYear", week: "$isoWeek" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } }
    ]).exec();

    const map: Record<string, number> = {};
    agg.forEach((r: any) => {
      const key = `${r._id.year}-W${pad2(r._id.week)}`;
      map[key] = r.count;
    });

    const weeks = getLastNWeeksISO(weeksCount, end);
    const points = weeks.map((w) => ({ date: w, msg: map[w] ?? 0 }));
    const totalTokensUsed = points.reduce((s, p) => s + p.msg, 0);

    return { totalTokensAvailable, totalTokensUsed, range, points };
  }

  // month-week branch (YYYY-MM-wN)
  // default weeks count for month-week
  const weeksCount = opts?.weeks ?? 3;
  const end = new Date();
  const endUtc = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999));
  const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (weeksCount * 7 - 1));

  const agg = await ChatHistory.aggregate([
    { $match: { shopId } },
    { $unwind: "$messages" },
    {
      $match: {
        "messages.role": "assistant",
        "messages.createdAt": { $gte: start, $lte: endUtc }
      }
    },
    {
      $project: {
        year: { $year: "$messages.createdAt" },
        month: { $month: "$messages.createdAt" },
        day: { $dayOfMonth: "$messages.createdAt" }
      }
    },
    {
      $project: {
        year: 1,
        month: 1,
        weekInMonth: { $ceil: { $divide: ["$day", 7] } }
      }
    },
    {
      $group: {
        _id: { year: "$year", month: "$month", week: "$weekInMonth" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } }
  ]).exec();

  const map: Record<string, number> = {};
  for (const r of agg as any[]) {
    const label = `${r._id.year}-${pad2(r._id.month)}-w${r._id.week}`;
    map[label] = r.count;
  }

  const labels = lastNMonthWeeks(weeksCount, end);
  const points = labels.map((lbl) => ({ date: lbl, msg: map[lbl] ?? 0 }));
  const totalTokensUsed = points.reduce((s, p) => s + p.msg, 0);

  return {
    totalTokensAvailable,
    totalTokensUsed,
    range: `last-${weeksCount}-weeks`,
    points
  };
}
