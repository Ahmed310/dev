// Public web-app config — safe to ship in client code.
const firebaseConfig = {
  apiKey: 'AIzaSyBmhSYPrJ39I34TvXBrAxSNW2JlOkMaDH4',
  authDomain: 'ahmed-dev-eb991.firebaseapp.com',
  projectId: 'ahmed-dev-eb991',
  storageBucket: 'ahmed-dev-eb991.firebasestorage.app',
  messagingSenderId: '746278326884',
  appId: '1:746278326884:web:5b7a5fb08bd6f63c3f0571',
  measurementId: 'G-XSDZ61RPH8',
};

type EventParams = Record<string, string | number | boolean>;
type QueuedEvent = [string, EventParams | undefined];

// Only measure the deployed site: `astro dev`, `astro preview`, and any
// locally served build stay silent so real data isn't polluted.
// If the site ever moves to a custom domain, update this hostname.
const ENABLED = import.meta.env.PROD && location.hostname === 'ahmed310.github.io';

// Events tracked before Firebase finishes loading are queued in memory and
// mirrored to sessionStorage, so a click that immediately navigates to
// another page of the site is sent from the next page instead of being lost.
const STASH_KEY = 'pending-analytics-events';

let send: ((event: string, params?: EventParams) => void) | null = null;
let queue: QueuedEvent[] = ENABLED ? readStash() : [];

function readStash(): QueuedEvent[] {
  try {
    const stash = JSON.parse(sessionStorage.getItem(STASH_KEY) ?? '[]');
    return Array.isArray(stash) ? stash : [];
  } catch {
    return [];
  }
}

function writeStash(): void {
  try {
    sessionStorage.setItem(STASH_KEY, JSON.stringify(queue));
  } catch {
    // Storage blocked or full — the event still flushes if this page survives.
  }
}

export function track(event: string, params?: EventParams): void {
  if (!ENABLED) return;
  if (send) {
    send(event, params);
  } else {
    queue.push([event, params]);
    writeStash();
  }
}

export async function initAnalytics(): Promise<void> {
  if (!ENABLED) return;
  // Firebase is imported lazily so this module stays tiny and the click
  // listener installs immediately instead of waiting on the ~70kB chunk.
  const [{ initializeApp }, { getAnalytics, isSupported, logEvent }] = await Promise.all([
    import('firebase/app'),
    import('firebase/analytics'),
  ]);
  if (!(await isSupported())) return;
  const analytics = getAnalytics(initializeApp(firebaseConfig));
  send = (event, params) => logEvent(analytics, event, params);
  for (const [event, params] of queue) send(event, params);
  queue = [];
  try {
    sessionStorage.removeItem(STASH_KEY);
  } catch {
    // Worst case the next page replays these few events once.
  }
}
