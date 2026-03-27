import { ScoringEngine, Response, ScoringResult } from './types';
import { phq9Scorer } from './phq9';
import { gad7Scorer } from './gad7';

export * from './types';
export { phq9Scorer } from './phq9';
export { gad7Scorer } from './gad7';

type InstrumentType = 'PHQ9' | 'GAD7' | 'PCL5' | 'AUDIT' | 'MMSE';

/**
 * Factory function to get the appropriate scorer for an instrument
 */
export function getScorer(instrumentType: InstrumentType): ScoringEngine {
  switch (instrumentType) {
    case 'PHQ9':
      return phq9Scorer;
    case 'GAD7':
      return gad7Scorer;
    case 'PCL5':
      throw new Error('PCL5 scorer not yet implemented');
    case 'AUDIT':
      throw new Error('AUDIT scorer not yet implemented');
    case 'MMSE':
      throw new Error('MMSE scorer not yet implemented');
    default:
      throw new Error(`Unknown instrument type: ${instrumentType}`);
  }
}

/**
 * Calculate score for any instrument
 */
export function calculateScore(
  instrumentType: InstrumentType,
  responses: Response[]
): ScoringResult {
  const scorer = getScorer(instrumentType);
  return scorer.calculate(responses);
}
