import { describe, it, expect } from 'vitest';
import { phq9Scorer } from '@/lib/scoring/phq9';
import { Response } from '@/lib/scoring/types';

describe('PHQ-9 Scorer', () => {
  describe('Severity Levels', () => {
    it('should classify score 0-4 as None', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 0 },
        { questionNumber: 2, value: 0 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 0 },
        { questionNumber: 8, value: 0 },
        { questionNumber: 9, value: 0 }, // Total: 4
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.totalScore).toBe(4);
      expect(result.severity).toBe('None');
      expect(result.severityColor).toBe('green');
    });

    it('should classify score 5-9 as Mild', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
        { questionNumber: 8, value: 1 },
        { questionNumber: 9, value: 0 }, // Total: 8
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.totalScore).toBe(8);
      expect(result.severity).toBe('Mild');
      expect(result.severityColor).toBe('yellow');
    });

    it('should classify score 10-14 as Moderate', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 2 },
        { questionNumber: 2, value: 2 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
        { questionNumber: 8, value: 1 },
        { questionNumber: 9, value: 0 }, // Total: 10
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.totalScore).toBe(10);
      expect(result.severity).toBe('Moderate');
      expect(result.severityColor).toBe('orange');
    });

    it('should classify score 15-19 as Moderately Severe', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 2 },
        { questionNumber: 2, value: 2 },
        { questionNumber: 3, value: 2 },
        { questionNumber: 4, value: 2 },
        { questionNumber: 5, value: 2 },
        { questionNumber: 6, value: 2 },
        { questionNumber: 7, value: 2 },
        { questionNumber: 8, value: 1 },
        { questionNumber: 9, value: 0 }, // Total: 15
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.totalScore).toBe(15);
      expect(result.severity).toBe('Moderately Severe');
      expect(result.severityColor).toBe('red');
    });

    it('should classify score 20-27 as Severe', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 3 },
        { questionNumber: 2, value: 3 },
        { questionNumber: 3, value: 3 },
        { questionNumber: 4, value: 3 },
        { questionNumber: 5, value: 3 },
        { questionNumber: 6, value: 3 },
        { questionNumber: 7, value: 2 },
        { questionNumber: 8, value: 1 },
        { questionNumber: 9, value: 0 }, // Total: 21
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.totalScore).toBe(21);
      expect(result.severity).toBe('Severe');
      expect(result.severityColor).toBe('red');
    });

    it('should handle maximum score (27)', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 3 },
        { questionNumber: 2, value: 3 },
        { questionNumber: 3, value: 3 },
        { questionNumber: 4, value: 3 },
        { questionNumber: 5, value: 3 },
        { questionNumber: 6, value: 3 },
        { questionNumber: 7, value: 3 },
        { questionNumber: 8, value: 3 },
        { questionNumber: 9, value: 3 }, // Total: 27
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.totalScore).toBe(27);
      expect(result.severity).toBe('Severe');
    });
  });

  describe('Critical Items', () => {
    it('should detect critical item when Q9 > 0', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 0 },
        { questionNumber: 2, value: 0 },
        { questionNumber: 3, value: 0 },
        { questionNumber: 4, value: 0 },
        { questionNumber: 5, value: 0 },
        { questionNumber: 6, value: 0 },
        { questionNumber: 7, value: 0 },
        { questionNumber: 8, value: 0 },
        { questionNumber: 9, value: 1 }, // Suicidal ideation
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.hasCriticalItem).toBe(true);
      expect(result.criticalItems).toEqual([9]);
      expect(result.interpretation).toContain('CRITICAL');
      expect(result.interpretation).toContain('Suicidal ideation');
    });

    it('should detect critical item when Q9 = 3', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
        { questionNumber: 8, value: 1 },
        { questionNumber: 9, value: 3 }, // Maximum suicidal ideation
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.hasCriticalItem).toBe(true);
      expect(result.criticalItems).toEqual([9]);
    });

    it('should NOT detect critical item when Q9 = 0', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 3 },
        { questionNumber: 2, value: 3 },
        { questionNumber: 3, value: 3 },
        { questionNumber: 4, value: 3 },
        { questionNumber: 5, value: 3 },
        { questionNumber: 6, value: 3 },
        { questionNumber: 7, value: 3 },
        { questionNumber: 8, value: 3 },
        { questionNumber: 9, value: 0 }, // No suicidal ideation
      ];

      const result = phq9Scorer.calculate(responses);
      expect(result.hasCriticalItem).toBe(false);
      expect(result.criticalItems).toBeUndefined();
      expect(result.interpretation).not.toContain('CRITICAL');
    });
  });

  describe('Validation', () => {
    it('should throw error for missing responses', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        // Missing questions 3-9
      ];

      expect(() => phq9Scorer.calculate(responses)).toThrow('Invalid response count');
    });

    it('should throw error for duplicate question numbers', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 1, value: 2 }, // Duplicate
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
        { questionNumber: 8, value: 1 },
        { questionNumber: 9, value: 0 },
      ];

      expect(() => phq9Scorer.calculate(responses)).toThrow('Duplicate question numbers');
    });

    it('should throw error for missing question number', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
        { questionNumber: 8, value: 1 },
        // Missing question 9
      ];

      expect(() => phq9Scorer.calculate(responses)).toThrow('Invalid response count');
    });
  });

  describe('Interpretation', () => {
    it('should include severity-specific guidance', () => {
      const mildResponses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 0 },
        { questionNumber: 7, value: 0 },
        { questionNumber: 8, value: 0 },
        { questionNumber: 9, value: 0 },
      ];

      const result = phq9Scorer.calculate(mildResponses);
      expect(result.interpretation).toContain('Mild depression');
      expect(result.interpretation).toContain('Monitor');
    });

    it('should include treatment recommendation for severe', () => {
      const severeResponses: Response[] = [
        { questionNumber: 1, value: 3 },
        { questionNumber: 2, value: 3 },
        { questionNumber: 3, value: 3 },
        { questionNumber: 4, value: 3 },
        { questionNumber: 5, value: 3 },
        { questionNumber: 6, value: 3 },
        { questionNumber: 7, value: 2 },
        { questionNumber: 8, value: 1 },
        { questionNumber: 9, value: 0 },
      ];

      const result = phq9Scorer.calculate(severeResponses);
      expect(result.interpretation).toContain('Severe depression');
      expect(result.interpretation).toContain('Immediate treatment');
    });
  });
});
