import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Log in · Community Events Board" };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams; // Next 15: searchParams is a Promise
  return <AuthForm mode="login" next={next} />;
}