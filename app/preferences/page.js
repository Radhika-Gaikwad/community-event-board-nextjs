import SiteHeader from "@/components/SiteHeader";
import FavouriteCategories from "@/components/FavouriteCategories";

export const metadata = { title: "Your interests · Community Events Board" };

export default function PreferencesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Your account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Choose your favourites</h1>
        <p className="mb-7 mt-2 max-w-2xl text-sm text-slate-600">Tell us what kind of plans you like. You can change these any time.</p>
        <FavouriteCategories />
      </main>
    </div>
  );
}