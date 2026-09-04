let pendingRequests = 0;
const listeners = new Set<() => void>();

export function beginApiRequest() {
  pendingRequests += 1;
  notify();
}

export function endApiRequest() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  notify();
}

export function getPendingApiRequests() {
  return pendingRequests;
}

export function subscribeApiActivity(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const listener of listeners) listener();
}