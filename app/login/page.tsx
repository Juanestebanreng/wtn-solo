import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

async function login(formData: FormData) {
  'use server';
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const redirectTo = String(formData.get('redirect') || '/dashboard');

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(redirectTo);
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; redirect?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 overflow-x-hidden">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-lg font-bold text-ink">
          WTN&nbsp;Solo
        </Link>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">Log in</h1>

        {searchParams.error && (
          <p className="mt-3 rounded border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
            {searchParams.error}
          </p>
        )}

        <form action={login} className="mt-6 space-y-4">
          <input type="hidden" name="redirect" value={searchParams.redirect || '/dashboard'} />
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
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>

        <p className="mt-6 text-sm text-slate">
          New here?{' '}
          <Link href="/signup" className="font-medium text-ink underline">
            Start a free trial
          </Link>
        </p>
      </div>
    </main>
  );
}
