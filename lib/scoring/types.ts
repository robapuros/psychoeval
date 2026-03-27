// Scoring Types for PsicoEval

export interface Response {
  questionNumber: number;
  value: number;
}

export interface QuestionResponse {
  questionNumber: number;
  value: number;
  critical?: boolean;
}

export interface ScoringResult {
  totalScore: number;
  minScore: number;
  maxScore: number;
  severity: string;
  severityLabel: string;
  recommendation: string;
  severityColor?: string;
  hasCriticalItem?: boolean;
  criticalItems?: number[];
  interpretation?: string;
}

export interface SeverityLevel {
  label: string;
  min: number;
  max: number;
  color: string;
}

export abstract class ScoringEngine {
  abstract calculate(responses: Response[]): ScoringResult;
  protected abstract getSeverityLevels(): SeverityLevel[];
  protected abstract getCriticalItems(responses: Response[]): number[];

  protected determineSeverity(score: number): { label: string; color: string } {
    const levels = this.getSeverityLevels();
    const level = levels.find(l => score >= l.min && score <= l.max);
    
    if (!level) {
      throw new Error(`Invalid score ${score} - no matching severity level`);
    }

    return { label: level.label, color: level.color };
  }

  protected validateResponses(responses: Response[], expectedCount: number): void {
    if (responses.length !== expectedCount) {
      throw new Error(
        `Invalid response count: expected ${expectedCount}, got ${responses.length}`
      );
    }

    // Check for duplicate question numbers
    const numbers = responses.map(r => r.questionNumber);
    const unique = new Set(numbers);
    if (unique.size !== numbers.length) {
      throw new Error('Duplicate question numbers detected');
    }

    // Verify all question numbers are present (1 to expectedCount)
    for (let i = 1; i <= expectedCount; i++) {
      if (!numbers.includes(i)) {
        throw new Error(`Missing response for question ${i}`);
      }
    }
  }
}
