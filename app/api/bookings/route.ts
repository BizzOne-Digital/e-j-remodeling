import { after } from "next/server";
import { getAvailability } from "@/lib/content";
import { clientIp, handler, HttpError, looksLikeSpam, ok, parseBody, rateLimit } from "@/lib/http";
import { notifyAdmin, sendMail } from "@/lib/mail";
import { makeRef } from "@/lib/refs";
import { addDaysTo, todayIn, weekdayOf } from "@/lib/utils";
import { Booking } from "@/models";
import { bookingSchema } from "@/validators/forms";

export const POST = handler(async (req) => {
  await rateLimit("booking", clientIp(req), 8, 3600);
  const { website, startedAt, consent, ...d } = await parseBody(req, bookingSchema);
  void consent;
  if (looksLikeSpam({ website, startedAt })) return ok({ reference: makeRef("EJ") }, 201);

  const a = await getAvailability();
  const today = todayIn(a.timeZone);
  const bad = (msg: string, field = "preferredDate") => new HttpError(400, msg, { [field]: msg });
  // Round-tripping through the calendar also rejects impossible dates such as Feb 31.
  if (Number.isNaN(Date.parse(d.preferredDate + "T12:00:00Z")) || addDaysTo(d.preferredDate, 0) !== d.preferredDate || d.preferredDate < addDaysTo(today, a.leadDays) || d.preferredDate > addDaysTo(today, a.maxDaysAhead)) throw bad("Choose an available upcoming date");
  if (!a.weekdays.includes(weekdayOf(d.preferredDate)) || a.blockedDates.includes(d.preferredDate)) throw bad("That date is not available. Please choose another.");
  if (!a.timeSlots.includes(d.preferredTime)) throw bad("Choose an available time", "preferredTime");

  const existing = d.submissionId && (await Booking.findOne({ submissionId: d.submissionId }).select("reference").lean());
  if (existing) return ok({ reference: existing.reference });
  let doc;
  try { doc = await Booking.create({ ...d, budget: d.budget ?? "", reference: makeRef("EJ") }); }
  catch (e) {
    const dupe = d.submissionId && (await Booking.findOne({ submissionId: d.submissionId }).select("reference").lean());
    if (dupe) return ok({ reference: dupe.reference });
    throw e;
  }
  after(async () => {
    await notifyAdmin(`New ${d.requestType.toLowerCase()} request ${doc.reference}`, { Reference: doc.reference, Name: d.fullName, Email: d.email, Phone: d.phone, Address: `${d.address}, ${d.city} ${d.zip}`, Service: d.service, "Preferred date": `${d.preferredDate} (${d.preferredTime})`, Budget: d.budget ?? "", "Contact by": d.contactMethod, Project: d.description }, d.email);
    await sendMail(d.email, `We received your request (${doc.reference})`, `Thank you for contacting E&J Kitchen and Bathroom Remodeling, LLC.\n\nYour reference is ${doc.reference}. Your requested time is not confirmed yet. We will review your project and contact you to confirm.\n\nQuestions? Call 570-656-2154.`);
  });
  return ok({ reference: doc.reference }, 201);
});
