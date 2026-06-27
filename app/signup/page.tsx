import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

async function signup(formData: FormData) {
  'use server';
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const companyName = String(formData.get('company_name'));
  const fullName = String(formData.get('full_name'));

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: companyName, full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    // Email confirmation is required by the Supabase project settings.
    redirect('/signup?check_email=1');
  }

  redirect('/onboarding');
}

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; check_email?: string };
}) {
  if (searchParams.check_email) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-6 overflow-x-hidden">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-2xl font-bold text-ink">Check your email</h1>
          <p className="mt-3 text-sm text-slate">
            We sent a confirmation link. Click it to activate your account and
            start your 14-day free trial.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 overflow-x-hidden">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-bold text-ink">
          WTN&nbsp;Solo
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">
          Start your free trial
        </h1>
        <p className="mt-1 text-sm text-slate">
          14 days free, then £14.99/month. Cancel any time.
        </p>

        {searchParams.error && (
          <p className="mt-3 rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </p>
        )}

        <form action={signup} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="company_name" required>
              Company name
            </Label>
            <Input id="company_name" name="company_name" required />
          </div>
          <div>
            <Label htmlFor="full_name" required>
              Your name
            </Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div>
            <Label htmlFor="email" required>
              Email
            </Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full">
            Start free trial
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-ink underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
