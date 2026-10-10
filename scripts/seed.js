import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../lib/models/User.js";
import Event from "../lib/models/Event.js";

// Dates are relative to "today", so there are always upcoming events
// no matter when a reviewer runs this. Times are in IST (UTC+5:30).
function istDate(daysFromToday, hour, minute = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  d.setUTCHours(hour - 5, minute - 30, 0, 0);
  return d;
}

const img = (slug) => `https://picsum.photos/seed/${slug}/800/450`;

const events = [
  // ---- Active and upcoming (visible to visitors) ----
  { title: "Coimbatore Music Night", category: "Music", city: "Coimbatore", startsAt: istDate(3, 18, 30), price: 499, imageUrl: img("music-night"), description: "An evening of live indie and folk bands under the open sky. Food stalls and seating available." },
  { title: "Weekend Food Fair", category: "Food", city: "Coimbatore", startsAt: istDate(4, 11), price: 100, imageUrl: img("food-fair"), description: "40+ stalls serving local street food, desserts and regional specials. Free tasting at the entrance." },
  { title: "Photography Masterclass", category: "Workshop", city: "Mumbai", startsAt: istDate(5, 10), price: 2500, imageUrl: img("photo-class"), description: "A hands-on day on composition, natural light and editing. Bring your own camera or phone." },
  { title: "Storytelling & Craft Morning", category: "Kids", city: "Mumbai", startsAt: istDate(6, 16), price: 250, imageUrl: img("kids-craft"), description: "Stories, paper crafts and games for children aged 4 to 9. Parents are welcome to stay." },
  { title: "City Cycling Tour", category: "Sports", city: "Pune", startsAt: istDate(7, 6), price: 300, imageUrl: img("cycling"), description: "A guided 25 km heritage ride through the old city. Helmets and breakfast included." },
  { title: "Jazz Under the Stars", category: "Music", city: "Bengaluru", startsAt: istDate(8, 20), price: 1200, imageUrl: img("jazz-night"), description: "A relaxed rooftop jazz night with a four-piece band and a craft mocktail menu." },
  { title: "Little Chefs Cooking Class", category: "Kids", city: "Bengaluru", startsAt: istDate(11, 15), price: 600, imageUrl: img("little-chefs"), description: "Kids make their own pizzas and fruit popsicles in a fun, supervised kitchen session." },
  { title: "Chef's Table Charity Gala", category: "Food", city: "Mumbai", startsAt: istDate(15, 19, 30), price: 150000, imageUrl: img("charity-gala"), description: "A seven-course fundraiser dinner by celebrated chefs. All proceeds support local school kitchens." },
  { title: "Community Football Cup", category: "Sports", city: "Coimbatore", startsAt: istDate(21, 8), price: 0, imageUrl: img("football-cup"), description: "A free five-a-side tournament open to all neighbourhood teams. Register at the gate." },

  // ---- Inactive (hidden from visitors) ----
  { title: "Indie Acoustic Evening", category: "Music", city: "Chennai", startsAt: istDate(6, 18, 30), price: 599, imageUrl: img("acoustic"), isActive: false, description: "An intimate acoustic set by upcoming indie artists." },
  { title: "Pottery for Beginners", category: "Workshop", city: "Pune", startsAt: istDate(9, 11), price: 1800, imageUrl: img("pottery"), isActive: false, description: "Learn to shape and glaze your first clay pot." },
  { title: "Sunrise 10K Run", category: "Sports", city: "Mumbai", startsAt: istDate(12, 5, 30), price: 500, imageUrl: img("sunrise-run"), isActive: false, description: "A scenic early-morning 10K along the sea face." },

  // ---- Past (never shown on the events page) ----
  { title: "Retro Bollywood Night", category: "Music", city: "Mumbai", startsAt: istDate(-10, 19), price: 799, imageUrl: img("retro-night"), description: "Dance to classic Bollywood hits from the 70s and 80s." },
  { title: "Street Food Carnival", category: "Food", city: "Pune", startsAt: istDate(-4, 12), price: 199, imageUrl: img("street-food"), description: "A weekend celebration of Pune's best street food." },
  { title: "Kids Science Fair", category: "Kids", city: "Bengaluru", startsAt: istDate(-20, 10), price: 149, imageUrl: img("science-fair"), description: "Fun experiments and demos for curious young minds." },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set. Check .env.local");
  await mongoose.connect(uri);

  // Re-running the seed resets events to a known state
  await Event.deleteMany({});
  await Event.insertMany(events);

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  // Find the admin if they already exist, otherwise create a new one
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) admin = new User({ email: adminEmail });

  admin.passwordHash = await bcrypt.hash(adminPassword, 10);
  admin.role = "admin";
  await admin.save();

  console.log(`Seeded ${events.length} events and admin user ${adminEmail}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});