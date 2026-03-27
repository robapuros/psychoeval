// Central export for all scoring modules

export * from './types';

// Export simple scoring functions
export { scorePHQ9 } from './phq9-simple';
export { scoreGAD7 } from './gad7-simple';
export { scorePCL5 } from './pcl5';
export { scoreAUDIT } from './audit';
export { scoreMEC } from './mec';

// Legacy exports (class-based scorers)
export * from './phq9';
export * from './gad7';

// Convenience function to get scoring function by instrument type
import { scorePHQ9 } from './phq9-simple';
import { scoreGAD7 } from './gad7-simple';
import { scorePCL5 } from './pcl5';
import { scoreAUDIT } from './audit';
import { scoreMEC } from './mec';
import type { QuestionResponse, ScoringResult } from './types';

export type InstrumentType = 'PHQ9' | 'GAD7' | 'PCL5' | 'AUDIT' | 'MEC';

export function getScorer(instrumentType: InstrumentType) {
  switch (instrumentType) {
    case 'PHQ9':
      return scorePHQ9;
    case 'GAD7':
      return scoreGAD7;
    case 'PCL5':
      return scorePCL5;
    case 'AUDIT':
      return scoreAUDIT;
    case 'MEC':
      return scoreMEC as any; // MEC tiene estructura diferente
    default:
      throw new Error(`Unknown instrument type: ${instrumentType}`);
  }
}

export function scoreInstrument(
  instrumentType: InstrumentType,
  responses: QuestionResponse[]
): ScoringResult {
  const scorer = getScorer(instrumentType);
  return scorer(responses);
}
