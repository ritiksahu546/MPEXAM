import { AdSlotConfig } from '../types';

/**
 * Normalizes an ad slot key to canonical form for robust uppercase/lowercase matching.
 * Handles aliases like 'header_ad' <=> 'HEADER', 'footer_ad' <=> 'FOOTER', etc.
 */
export function normalizeSlotKey(key?: string | null): string {
  if (!key || typeof key !== 'string') return '';
  const clean = key
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  if (clean === 'header' || clean === 'header_ad') return 'header';
  if (clean === 'footer' || clean === 'footer_ad') return 'footer';
  if (clean === 'top_content' || clean === 'top_content_ad') return 'top_content';
  if (clean === 'article_before' || clean === 'article_top') return 'article_before';
  if (clean === 'article_middle') return 'article_middle';
  if (clean === 'article_after' || clean === 'article_bottom') return 'article_after';
  if (clean === 'sidebar' || clean === 'sidebar_ad') return 'sidebar';
  if (clean === 'between_posts') return 'between_posts';
  if (clean === 'mobile_sticky') return 'mobile_sticky';

  return clean;
}

/**
 * Checks whether an AdSlotConfig matches a target slot key (e.g. 'header_ad' vs 'HEADER')
 */
export function matchAdSlot(slot: AdSlotConfig | undefined | null, targetKey: string): boolean {
  if (!slot || !targetKey) return false;
  const targetNorm = normalizeSlotKey(targetKey);
  const slotKeyNorm = normalizeSlotKey(slot.slotKey);
  const slotNorm = normalizeSlotKey(slot.slot as string);
  const idNorm = normalizeSlotKey(slot.id);

  return slotKeyNorm === targetNorm || slotNorm === targetNorm || idNorm === targetNorm;
}

/**
 * Finds the matching AdSlotConfig from an array of slots.
 */
export function findAdSlot(slots: AdSlotConfig[] = [], targetKey: string): AdSlotConfig | undefined {
  return slots.find(s => matchAdSlot(s, targetKey));
}
