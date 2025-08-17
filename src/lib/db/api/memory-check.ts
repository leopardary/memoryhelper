'use server'
import MemoryCheck from '@/lib/db/model/MemoryCheck';
import { connectDB } from '@/lib/db/utils';
import { MemoryCheckProps } from '@/app/components/utils';
import { UpdateMemoryCheckInput } from '@/lib/db/model/types/MemoryCheck.types';

export async function getMemoryCheck(id: string) {
  await connectDB();
  return MemoryCheck.findById(id);
}

export async function updateMemoryCheck(id: string, data: UpdateMemoryCheckInput) {
  await connectDB();
  return MemoryCheck.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );
}

export async function deleteMemoryCheck(id: string) {
  await connectDB();
  return MemoryCheck.findByIdAndDelete(id);
}

export async function createMemoryCheck(memoryCheck: MemoryCheckProps) {
  await connectDB();
  const score = await normalizeScore(memoryCheck.score);
  try {
    await MemoryCheck.create({ ...memoryCheck, score: score });
  } catch (e) {
    console.error(`MemoryCheck ${memoryCheck} not found due to error: `, e);
    return false;
  }
  return true;
}

export async function createMemoryCheckInBatch(data: MemoryCheckProps[]) {
  await connectDB();
  const memoryChecks = [];
  for (const memoryCheck of data) {
    const score = await normalizeScore(memoryCheck.score);
    try {
      const record = await MemoryCheck.create({ ...memoryCheck, score: score });
      memoryChecks.push(record._id.toString());
    } catch (e) {
      console.error(`MemoryCheck ${memoryCheck} not found due to error: `, e);
    }
  }
  return memoryChecks;
}

export async function findMemoryChecksInBatch(ids: string[]) {
  await connectDB();
  const memoryChecks = [];
  for (const id of ids) {
    try {
      const memoryCheck = await MemoryCheck.findById(id);
      memoryChecks.push(memoryCheck);
    } catch (e) {
      console.error(`MemoryCheck with id ${id} not found due to error: `, e);
    }
  }
  return memoryChecks;
}

/**
 * Enum representing the quality of a memory recall, on a scale of 0-5.
 * This corresponds to common Spaced Repetition System (SRS) quality scores.
 */
enum ScoreQuality {
  /** (0) Complete blackout, no recollection. */
  Blackout = 0,
  /** (1) Incorrect response, but perhaps made an attempt or remembered something vague. */
  IncorrectButAttempted = 1,
  /** (2) Incorrect response, but got close, or correct but with extreme difficulty. */
  IncorrectCloseOrCorrectHardest = 2,
  /** (3) Correct response, but recalled with significant difficulty. */
  CorrectWithDifficulty = 3,
  /** (4) Correct response, recalled with some hesitation or minor difficulty (Good). */
  CorrectWithHesitation = 4,
  /** (5) Perfect recall, effortless and immediate. */
  Perfect = 5,
}

/**
 * Normalizes an input value (boolean or a number 0-100) to a ScoreQuality enum value (0-5).
 *
 * @param value The value to normalize. Can be a boolean or a number (0-100).
 * @returns A Promise resolving to a ScoreQuality number (0-5).
 * @throws Error if the input value is of an unexpected type.
 */
export async function normalizeScore(value: unknown): Promise<ScoreQuality> {
  if (typeof value === 'boolean') {
    if (value === true) {
      // Boolean true could map to a "good" correct answer.
      return ScoreQuality.Perfect; // Returns 5
    } else {
      // Boolean false maps to an incorrect answer.
      return ScoreQuality.Blackout; // Returns 0
    }
  }

  if (typeof value === 'number') {
    // Clamp the number to the 0-100 range
    const clampedValue = Math.max(0, Math.min(100, value));

    // Define thresholds for mapping 0-100 to 0-5
    // These thresholds can be adjusted based on your specific needs.
    if (clampedValue >= 96) { // 96-100
      return ScoreQuality.Perfect; // 5
    } else if (clampedValue >= 81) { // 81-95
      return ScoreQuality.CorrectWithHesitation; // 4
    } else if (clampedValue >= 61) { // 61-80
      return ScoreQuality.CorrectWithDifficulty; // 3
    } else if (clampedValue >= 41) { // 41-60
      return ScoreQuality.IncorrectCloseOrCorrectHardest; // 2
    } else if (clampedValue >= 11) { // 11-40 (0-10 will be Blackout)
      return ScoreQuality.IncorrectButAttempted; // 1
    } else { // 0-10
      return ScoreQuality.Blackout; // 0
    }
  }

  // Handle unexpected types
  throw new Error(
    `Invalid input type for normalizeScore. Expected boolean or number, but received ${typeof value}.`
  );
}