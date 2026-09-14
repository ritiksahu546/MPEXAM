/**
 * Utility for safe local persistence and real-time synchronization of saved/bookmarked jobs.
 */

const BOOKMARKS_STORAGE_KEY = 'mp_exam_saved_jobs_v2';
const LEGACY_STORAGE_KEY = 'saved_jobs';

export const BOOKMARKS_EVENT = 'mp_bookmarks_updated';

/**
 * Safely retrieves all saved job IDs and slugs from localStorage.
 */
export function getSavedJobIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    // Check primary key first
    let raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!raw) {
      // Check legacy key
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    }
    if (!raw) return [];
    
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Deduplicate and filter strings
    const valid = Array.from(new Set(parsed.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))));
    return valid;
  } catch (err) {
    console.warn('Could not read saved jobs from localStorage:', err);
    return [];
  }
}

/**
 * Checks if a specific post (by id or slug) is saved.
 */
export function isJobSaved(identifier: string): boolean {
  if (!identifier) return false;
  const list = getSavedJobIds();
  const clean = identifier.trim().toLowerCase();
  return list.some(item => item.toLowerCase() === clean);
}

/**
 * Toggles the saved state for a job.
 * Dispatches a window event so all subscribed components update synchronously.
 * Returns the new saved state (true = now saved, false = removed).
 */
export function toggleJobSaved(post: { id: string; slug: string }): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getSavedJobIds();
    const id = post.id?.trim();
    const slug = post.slug?.trim();

    const isCurrentlySaved = list.some(
      item => (id && item === id) || (slug && item === slug)
    );

    let updatedList: string[];
    let newState: boolean;

    if (isCurrentlySaved) {
      // Remove both slug and id to ensure cleanliness
      updatedList = list.filter(item => item !== id && item !== slug);
      newState = false;
    } else {
      // Save primary slug (fallback to id)
      const toSave = slug || id;
      if (toSave) {
        updatedList = [toSave, ...list.filter(item => item !== id && item !== slug)];
      } else {
        updatedList = list;
      }
      newState = true;
    }

    // Persist to both modern and legacy keys for maximum compatibility
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updatedList));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(updatedList));

    // Dispatch global event
    window.dispatchEvent(
      new CustomEvent(BOOKMARKS_EVENT, {
        detail: { count: updatedList.length, saved: newState, postId: post.id, postSlug: post.slug }
      })
    );

    return newState;
  } catch (err) {
    console.warn('Error toggling job bookmark:', err);
    return false;
  }
}

/**
 * Clears all saved jobs from localStorage.
 */
export function clearAllSavedJobs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(BOOKMARKS_EVENT, { detail: { count: 0 } })
    );
  } catch (err) {
    console.warn('Error clearing saved jobs:', err);
  }
}

/**
 * Returns the total count of saved jobs.
 */
export function getSavedJobsCount(): number {
  return getSavedJobIds().length;
}
