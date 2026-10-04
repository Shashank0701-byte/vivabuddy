const CHANGE_EVENT = "vivabuddy-session-change";

export function subscribeToSessionChanges(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function readSessionValue(key: string) {
  return typeof window === "undefined" ? "" : window.sessionStorage.getItem(key) ?? "";
}

export function saveSessionValue(key: string, value: string) {
  window.sessionStorage.setItem(key, value);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
