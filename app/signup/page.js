import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign up · Community Events Board" };

export default async function SignupPage({ searchParams }) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" next={next} />;
}