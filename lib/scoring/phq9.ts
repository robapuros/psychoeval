import { ScoringEngine, Response, ScoringResult, SeverityLevel } from './types';

/**
 * PHQ-9 Scoring Engine
 * Patient Health Questionnaire for Depression
 * 
 * Scoring:
 * - 9 questions, each scored 0-3
 * - Total range: 0-27
 * - Question 9 is critical (suicidal ideation)
 * 
 * Severity Levels:
 * - None: 0-4
 * - Mild: 5-9
 * - Moderate: 10-14
 * - Moderately Severe: 15-19
 * - Severe: 20-27
 */
export class PHQ9Scorer extends ScoringEngine {
  private static readonly QUESTION_COUNT = 9;
  private static readonly CRITICAL_QUESTION = 9; // Suicidal ideation

  calculate(responses: Response[]): ScoringResult {
    // Validate responses
    this.validateResponses(responses, PHQ9Scorer.QUESTION_COUNT);

    // Calculate total score
    const totalScore = responses.reduce((sum, r) => sum + r.value, 0);

    // Determine severity
    const { label, color } = this.determineSeverity(totalScore);

    // Check for critical items
    const criticalItems = this.getCriticalItems(responses);
    const hasCriticalItem = criticalItems.length > 0;

    // Generate interpretation
    const interpretation = this.getInterpretation(label, hasCriticalItem);

    return {
      totalScore,
      severity: label,
      severityColor: color,
      hasCriticalItem,
      criticalItems: hasCriticalItem ? criticalItems : undefined,
      interpretation,
    };
  }

  protected getSeverityLevels(): SeverityLevel[] {
    return [
      { label: 'None', min: 0, max: 4, color: 'green' },
      { label: 'Mild', min: 5, max: 9, color: 'yellow' },
      { label: 'Moderate', min: 10, max: 14, color: 'orange' },
      { label: 'Moderately Severe', min: 15, max: 19, color: 'red' },
      { label: 'Severe', min: 20, max: 27, color: 'red' },
    ];
  }

  protected getCriticalItems(responses: Response[]): number[] {
    const q9 = responses.find(r => r.questionNumber === PHQ9Scorer.CRITICAL_QUESTION);
    
    // Question 9 (suicidal ideation) is critical if value > 0
    if (q9 && q9.value > 0) {
      return [PHQ9Scorer.CRITICAL_QUESTION];
    }

    return [];
  }

  private getInterpretation(severity: string, hasCriticalItem: boolean): string {
    const interpretations: Record<string, string> = {
      'None': 'Minimal or no depression symptoms.',
      'Mild': 'Mild depression. Monitor symptoms and consider follow-up.',
      'Moderate': 'Moderate depression. Treatment should be considered.',
      'Moderately Severe': 'Moderately severe depression. Active treatment is recommended.',
      'Severe': 'Severe depression. Immediate treatment is strongly recommended.',
    };

    let interpretation = interpretations[severity] || '';

    if (hasCriticalItem) {
      interpretation += ' ⚠️ CRITICAL: Suicidal ideation detected. Immediate clinical assessment recommended.';
    }

    return interpretation;
  }
}

// Export singleton instance
export const phq9Scorer = new PHQ9Scorer();
