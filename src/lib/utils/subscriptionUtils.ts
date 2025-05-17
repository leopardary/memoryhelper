// --- Configuration Parameters ---
export const SRS_PARAMETERS = {
  INITIAL_INTERVAL_NEW_WORD: 1.0,         // days, after first good recall for a new/lapsed word
  INITIAL_INTERVAL_LAPSE: 1.0,            // days, after a lapse (q < 3)
  GRADUATING_INTERVAL_FIRST_SUCCESSIVE: 3.0, // days, after the second consecutive good recall (previously was at INITIAL_INTERVAL_NEW_WORD)
  DEFAULT_EASE_FACTOR: 2.5,
  MINIMUM_EASE_FACTOR: 1.3,
  MAXIMUM_INTERVAL: 365,                  // days
  HISTORY_WEIGHT_DECAY_RATE: 0.85,        // How quickly influence of older reviews diminishes for HPM
  RECENT_HISTORY_WINDOW: 5,               // How many recent reviews to consider for HPM
  EASE_SENSITIVITY_TO_HISTORY: 0.1,       // Scales HPM's impact on ease_factor adjustment
  QUALITY_TO_SCORE_MAP: { // For HPM calculation
      5: 1.0,  // Perfect
      4: 0.6,  // Good
      3: 0.2,  // Hard Correct
      2: -0.2, // Almost
      1: -0.6, // Incorrect
      0: -1.0  // Blackout
  },
  // For ease factor adjustment: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  EASE_BASE_ADJUSTMENT_CENTER: 0.1,
  EASE_Q_FACTOR_1: 0.08,
  EASE_Q_FACTOR_2: 0.02
};

/**
 * Initializes a Subscription for a MemoryPiece and a Userr.
 * @param {string} memoryPieceId - The id for the MemoryPiece.
 * @param {string} userId - The id for the User.
 * @returns {object} The initialized Subscription object.
 */
export function initializeSubscription(memoryPieceId: string, userId: string) {
  return {
    memoryPieceId,
    userId,
    easeFactor: SRS_PARAMETERS.DEFAULT_EASE_FACTOR,
    currentInterval: SRS_PARAMETERS.INITIAL_INTERVAL_NEW_WORD, 
    nextTestDate: getTodayDate(),
    status: 'new'
  };
}

// --- Date Helper Functions ---
function getTodayDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  return today;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + Math.round(days));
  return result;
}

// --- Core SRS Functions ---



/**
* Calculates the Historical Performance Modifier (HPM).
* @param {Array<object>} checkHistory - The word's MemoryCheck history.
* @returns {number} The HPM value (typically between -1 and 1).
*/
function calculateHpm(checkHistory: object[]) {
  if (!checkHistory || checkHistory.length === 0) {
      return 0.0;
  }

  const recentHistory = checkHistory.slice(-SRS_PARAMETERS.RECENT_HISTORY_WINDOW);
  let weightedScoreSum = 0.0;
  let total_weight = 0.0;
  let current_weight = 1.0;

  for (let i = recentHistory.length - 1; i >= 0; i--) {
      const review = recentHistory[i];
      const score = SRS_PARAMETERS.QUALITY_TO_SCORE_MAP[review.quality_of_response] || 0.0;
      weightedScoreSum += score * current_weight;
      total_weight += current_weight;
      current_weight *= SRS_PARAMETERS.HISTORY_WEIGHT_DECAY_RATE;
  }

  if (total_weight === 0) {
      return 0.0;
  }
  return weightedScoreSum / total_weight;
}

/**
* Processes a MemoryCheck and updates its Subscription.
* @param {number} current_ease_factor - {@link Subscription#easeFactor}.
* @param {number} current_interval - {@link Subscription#currentInterval}.
* @param {object[]} checkHistory - {@link Subscription#memoryChecks}.
* @returns {object} The properties to update the {@link Subscription}.
*/
export function processMemoryCheckWithHistory(current_ease_factor: number, current_interval: number, checkHistory: object[]) {
  const lastMemoryCheck = checkHistory.pop();
  let currentQualityResponse = lastMemoryCheck?.score;
  const checkDate = lastMemoryCheck?.createdAt;
  if (currentQualityResponse < 0 || currentQualityResponse > 5) {
      throw new Error("Quality of response must be between 0 and 5.");
  }
  currentQualityResponse = Math.round(currentQualityResponse);

  const today = new Date(checkDate); // Use provided checkDate

  // 1. Calculate HPM from history *before* this review
  const hpmRaw = calculateHpm(checkHistory);

  // 2. Update Ease Factor
  const baseEaseAdjustment = (
      SRS_PARAMETERS.EASE_BASE_ADJUSTMENT_CENTER -
      (5 - currentQualityResponse) * (SRS_PARAMETERS.EASE_Q_FACTOR_1 + (5 - currentQualityResponse) * SRS_PARAMETERS.EASE_Q_FACTOR_2)
  );
  const historicalInfluence = hpmRaw * SRS_PARAMETERS.EASE_SENSITIVITY_TO_HISTORY;

  const new_ease_factor = Math.max(SRS_PARAMETERS.MINIMUM_EASE_FACTOR, current_ease_factor + baseEaseAdjustment + historicalInfluence);
  let new_interval;
  let next_review_date;
  let new_status;

  // 3. & 4. Update Interval based on currentQualityResponse
  if (currentQualityResponse < 3) { // LAPSE: Incorrect or very hard (treat as lapse for interval)
    // reset status if the current response is not right.
    new_status = 'lapsed';
    new_interval = SRS_PARAMETERS.INITIAL_INTERVAL_NEW_WORD;
    next_review_date = addDays(checkDate, new_interval);
  } else {
    if (current_interval < SRS_PARAMETERS.GRADUATING_INTERVAL_FIRST_SUCCESSIVE) {
        new_interval = Math.max(current_interval + 0.5, current_interval * (new_ease_factor));
        next_review_date = addDays(today, new_interval);
        new_status = "learning";
      } else {
        // Subsequent correct reviews for an established word
        new_interval = Math.min(SRS_PARAMETERS.MAXIMUM_INTERVAL, current_interval * new_ease_factor);
        next_review_date = addDays(today, new_interval);
        new_status = "learned";
      }
  }
  return {
    new_status: new_status,
    new_ease_factor: new_ease_factor,
    new_interval: new_interval,
    next_review_date: next_review_date
  };
}

