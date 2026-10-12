export type DiffKind = "equal" | "added" | "removed";

export interface DiffSegment {
  readonly kind: DiffKind;
  readonly text: string;
}

/** Above this many LCS cells the diff degrades to "all removed, all added" to stay responsive. */
const MAX_DIFF_CELLS = 250_000;
const MIN_MATCH_SIMILARITY = 0.2;

function toWords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word.length > 0);
}

function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function mergeSegments(segments: readonly DiffSegment[]): DiffSegment[] {
  const merged: DiffSegment[] = [];
  for (const segment of segments) {
    const last = merged.at(-1);
    if (last && last.kind === segment.kind) {
      merged[merged.length - 1] = { kind: last.kind, text: `${last.text} ${segment.text}` };
    } else {
      merged.push(segment);
    }
  }
  return merged;
}

function buildLcsTable(
  a: readonly string[],
  b: readonly string[],
): (i: number, j: number) => number {
  const cols = b.length + 1;
  const table = new Uint32Array((a.length + 1) * cols);
  const at = (i: number, j: number): number => table[i * cols + j] ?? 0;
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i * cols + j] =
        a[i] === b[j] ? at(i + 1, j + 1) + 1 : Math.max(at(i + 1, j), at(i, j + 1));
    }
  }
  return at;
}

/** Word-level diff based on the longest common subsequence, ignoring case and edge punctuation. */
export function diffWords(before: string, after: string): DiffSegment[] {
  const oldWords = toWords(before);
  const newWords = toWords(after);
  if (oldWords.length * newWords.length > MAX_DIFF_CELLS) {
    return mergeSegments([
      { kind: "removed", text: oldWords.join(" ") },
      { kind: "added", text: newWords.join(" ") },
    ]).filter((segment) => segment.text.length > 0);
  }

  const oldKeys = oldWords.map(normalizeWord);
  const newKeys = newWords.map(normalizeWord);
  const lcs = buildLcsTable(oldKeys, newKeys);
  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < oldWords.length || j < newWords.length) {
    const oldWord = oldWords[i];
    const newWord = newWords[j];
    if (oldWord !== undefined && newWord !== undefined && oldKeys[i] === newKeys[j]) {
      segments.push({ kind: "equal", text: newWord });
      i += 1;
      j += 1;
    } else if (oldWord !== undefined && (newWord === undefined || lcs(i + 1, j) >= lcs(i, j + 1))) {
      segments.push({ kind: "removed", text: oldWord });
      i += 1;
    } else if (newWord !== undefined) {
      segments.push({ kind: "added", text: newWord });
      j += 1;
    }
  }
  return mergeSegments(segments);
}

export function similarity(a: string, b: string): number {
  const left = new Set(toWords(a).map(normalizeWord));
  const right = new Set(toWords(b).map(normalizeWord));
  if (left.size === 0 && right.size === 0) {
    return 1;
  }
  const shared = [...left].filter((word) => right.has(word)).length;
  return shared / (left.size + right.size - shared);
}

/**
 * Index of the candidate most similar to `target` (or -1), used to pair reordered bullets.
 * Indices in `excluded` are skipped so each original line is matched at most once.
 */
export function findBestMatchIndex(
  target: string,
  candidates: readonly string[],
  excluded: ReadonlySet<number> = new Set(),
): number {
  let bestIndex = -1;
  let bestScore = MIN_MATCH_SIMILARITY;
  candidates.forEach((candidate, index) => {
    if (excluded.has(index)) return;
    const score = similarity(target, candidate);
    if (score > bestScore || (bestIndex === -1 && score === bestScore)) {
      bestIndex = index;
      bestScore = score;
    }
  });
  return bestIndex;
}

export interface ListComparison {
  readonly added: readonly string[];
  readonly removed: readonly string[];
}

export function compareLists(before: readonly string[], after: readonly string[]): ListComparison {
  const beforeKeys = new Set(before.map((item) => item.toLowerCase()));
  const afterKeys = new Set(after.map((item) => item.toLowerCase()));
  return {
    added: after.filter((item) => !beforeKeys.has(item.toLowerCase())),
    removed: before.filter((item) => !afterKeys.has(item.toLowerCase())),
  };
}
