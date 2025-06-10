'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the auth setup page
    router.replace('/auth/setup');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p>Redirecting to setup...</p>
      </div>
    </div>
  );
}