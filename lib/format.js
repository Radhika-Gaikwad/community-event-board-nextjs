const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// 150000 -> "₹1,50,000"   0 -> "Free"
export function formatPrice(price) {
  return price === 0 ? "Free" : priceFormatter.format(price);
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

// "2026-10-18T13:00:00.000Z" -> "Sat, 18 Oct, 6:30 PM"
export function formatEventDate(iso) {
  const p = Object.fromEntries(
    dateFormatter.formatToParts(new Date(iso)).map((part) => [part.type, part.value])
  );
  return `${p.weekday}, ${p.day} ${p.month}, ${p.hour}:${p.minute} ${p.dayPeriod.toUpperCase()}`;
}