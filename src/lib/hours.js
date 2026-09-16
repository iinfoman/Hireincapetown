// "Open now" is the one thing on a public page that CANNOT be prerendered —
// it depends on when the visitor looks. So the build emits the hours and this
// runs in the browser. Cape Town is UTC+2 year-round, no DST.
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const SAST_OFFSET_MIN = 120;

export function nowInCapeTown(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + SAST_OFFSET_MIN * 60000);
}

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** → { open: boolean, label: string, emergency: boolean } */
export function openState(hours, date = new Date()) {
  if (!hours) return { open: false, label: 'Hours not listed', emergency: false };
  const local = nowInCapeTown(date);
  const today = hours[DAYS[local.getDay()]];
  const emergency = Boolean(hours.emergency24h);
  const mins = local.getHours() * 60 + local.getMinutes();

  if (today) {
    const [from, to] = today.map(toMinutes);
    // A closing time before the opening time means the shift runs past midnight
    // (e.g. 18:00–02:00), so "inside the shift" wraps around the end of the day.
    const overnight = to <= from;
    const isOpen = overnight ? (mins >= from || mins < to) : (mins >= from && mins < to);
    if (isOpen) {
      return { open: true, label: emergency ? 'Open · 24 hr callout' : `Open · closes ${today[1]}`, emergency };
    }
    if (!overnight && mins < from) {
      return { open: emergency, label: emergency ? 'Open · 24 hr callout' : `Closed · opens ${today[0]}`, emergency };
    }
  }
  // Shut for the day: find the next day with hours.
  for (let i = 1; i <= 7; i++) {
    const d = hours[DAYS[(local.getDay() + i) % 7]];
    if (d) {
      const when = i === 1 ? 'tomorrow' : DAYS[(local.getDay() + i) % 7].replace(/^\w/, (c) => c.toUpperCase());
      return { open: emergency, label: emergency ? 'Open · emergencies only' : `Closed · opens ${when} ${d[0]}`, emergency };
    }
  }
  return { open: emergency, label: emergency ? 'Emergencies only' : 'Closed', emergency };
}
