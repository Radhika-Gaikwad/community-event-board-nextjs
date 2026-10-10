import LogoutButton from "@/components/LogoutButton";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>
      <p className="text-slate-600">You are logged in as admin. Event management arrives on Day 2.</p>
      <LogoutButton />
    </main>
  );
}