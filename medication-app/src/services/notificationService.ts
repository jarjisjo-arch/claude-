// Remote in-app announcement banner.
// The app fetches this JSON at launch; edit the hosted file to change the message
// for everyone — no app update required. See notification.json at the repo root.
//
// To point at a different host, change REMOTE_URL below.
const REMOTE_URL =
  'https://raw.githubusercontent.com/jarjisjo-arch/claude-/claude/build-new-app-2pkXO/notification.json';

export interface Announcement {
  show: boolean;
  id: string;
  title: string;
  message: string;
  titleAr?: string;
  messageAr?: string;
  type?: 'info' | 'update' | 'warning';
  link?: string;          // optional URL opened when the banner is tapped
}

// Fetches the remote announcement. Returns null on any failure (offline,
// missing file, bad JSON) so the app simply shows nothing and works normally.
export async function fetchAnnouncement(): Promise<Announcement | null> {
  try {
    const res = await fetch(`${REMOTE_URL}?t=${Math.floor(Date.now() / 60000)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Announcement;
    if (!data || typeof data.show !== 'boolean' || !data.id) return null;
    return data;
  } catch {
    return null;
  }
}
