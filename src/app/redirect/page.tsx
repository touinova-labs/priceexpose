'use client';

import { Suspense } from 'react';
import RedirectContent from './redirect-content';

export default function RedirectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedirectContent />
    </Suspense>
  );
}
