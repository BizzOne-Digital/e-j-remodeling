import { getAvailability } from "@/lib/content";
import { handler, ok } from "@/lib/http";
import { todayIn } from "@/lib/utils";
export const GET = handler(async () => {
  const a = await getAvailability();
  const min = todayIn(a.timeZone, a.leadDays);
  return ok({ weekdays: a.weekdays, timeSlots: a.timeSlots, blockedDates: a.blockedDates.filter((d) => d >= min), min, max: todayIn(a.timeZone, a.maxDaysAhead) });
});
