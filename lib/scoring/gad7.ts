import { ScoringEngine, Response, ScoringResult, SeverityLevel } from './types';

/**
 * GAD-7 Scoring Engine
 * Generalized Anxiety Disorder 7-item scale
 * 
 * Scoring:
 * - 7 questions, each scored 0-3
 * - Total range: 0-21
 * - No specific critical items (unlike PHQ-9)
 * 
 * Severity Levels:
 * - Minimal: 0-4
 * - Mild: 5-9
 * - Moderate: 10-14
 * - Severe: 15-21
 */
export class GAD7Scorer extends ScoringEngine {
  private static readonly QUESTION_COUNT = 7;

  calculate(responses: Response[]): ScoringResult {
    // Validate responses
    this.validateResponses(responses, GAD7Scorer.QUESTION_COUNT);

    // Calculate total score
    const totalScore = responses.reduce((sum, r) => sum + r.value, 0);

    // Determine severity
    const { label, color } = this.determineSeverity(totalScore);

    // Check for critical items (GAD-7 has none by default)
    const criticalItems = this.getCriticalItems(responses);
    const hasCriticalItem = criticalItems.length > 0;

    // Generate interpretation
    const interpretation = this.getInterpretation(label);

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
      { label: 'Minimal', min: 0, max: 4, color: 'green' },
      { label: 'Mild', min: 5, max: 9, color: 'yellow' },
      { label: 'Moderate', min: 10, max: 14, color: 'orange' },
      { label: 'Severe', min: 15, max: 21, color: 'red' },
    ];
  }

  protected getCriticalItems(responses: Response[]): number[] {
    // GAD-7 does not have specific critical items
    // Could be extended to flag very high individual item scores
    return [];
  }

  private getInterpretation(severity: string): string {
    const interpretations: Record<string, string> = {
      'Minimal': 'Minimal anxiety symptoms.',
      'Mild': 'Mild anxiety. Monitor symptoms and consider lifestyle interventions.',
      'Moderate': 'Moderate anxiety. Treatment should be considered.',
      'Severe': 'Severe anxiety. Active treatment is strongly recommended.',
    };

    return interpretations[severity] || '';
  }
}

// Export singleton instance
export const gad7Scorer = new GAD7Scorer();
