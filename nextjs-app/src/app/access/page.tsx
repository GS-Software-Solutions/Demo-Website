import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AccessGate from '@/components/access/AccessGate';
import { isAuthorizedCookieStore } from '@/lib/server/auth';

export default async function AccessPage() {
  const cookieStore = await cookies();
  if (isAuthorizedCookieStore(cookieStore)) {
    redirect('/');
  }

  return <AccessGate />;
}
