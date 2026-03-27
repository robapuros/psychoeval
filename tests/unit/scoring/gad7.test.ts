import { describe, it, expect } from 'vitest';
import { gad7Scorer } from '@/lib/scoring/gad7';
import { Response } from '@/lib/scoring/types';

describe('GAD-7 Scorer', () => {
  describe('Severity Levels', () => {
    it('should classify score 0-4 as Minimal', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 0 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 0 },
        { questionNumber: 7, value: 0 }, // Total: 4
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.totalScore).toBe(4);
      expect(result.severity).toBe('Minimal');
      expect(result.severityColor).toBe('green');
    });

    it('should classify score 5-9 as Mild', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 2 },
        { questionNumber: 5, value: 2 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 }, // Total: 9
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.totalScore).toBe(9);
      expect(result.severity).toBe('Mild');
      expect(result.severityColor).toBe('yellow');
    });

    it('should classify score 10-14 as Moderate', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 2 },
        { questionNumber: 2, value: 2 },
        { questionNumber: 3, value: 2 },
        { questionNumber: 4, value: 2 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 2 }, // Total: 12
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.totalScore).toBe(12);
      expect(result.severity).toBe('Moderate');
      expect(result.severityColor).toBe('orange');
    });

    it('should classify score 15-21 as Severe', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 3 },
        { questionNumber: 2, value: 3 },
        { questionNumber: 3, value: 3 },
        { questionNumber: 4, value: 3 },
        { questionNumber: 5, value: 2 },
        { questionNumber: 6, value: 2 },
        { questionNumber: 7, value: 2 }, // Total: 18
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.totalScore).toBe(18);
      expect(result.severity).toBe('Severe');
      expect(result.severityColor).toBe('red');
    });

    it('should handle maximum score (21)', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 3 },
        { questionNumber: 2, value: 3 },
        { questionNumber: 3, value: 3 },
        { questionNumber: 4, value: 3 },
        { questionNumber: 5, value: 3 },
        { questionNumber: 6, value: 3 },
        { questionNumber: 7, value: 3 }, // Total: 21
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.totalScore).toBe(21);
      expect(result.severity).toBe('Severe');
    });

    it('should handle minimum score (0)', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 0 },
        { questionNumber: 2, value: 0 },
        { questionNumber: 3, value: 0 },
        { questionNumber: 4, value: 0 },
        { questionNumber: 5, value: 0 },
        { questionNumber: 6, value: 0 },
        { questionNumber: 7, value: 0 }, // Total: 0
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.totalScore).toBe(0);
      expect(result.severity).toBe('Minimal');
    });
  });

  describe('Critical Items', () => {
    it('should NOT have critical items by default', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 3 },
        { questionNumber: 2, value: 3 },
        { questionNumber: 3, value: 3 },
        { questionNumber: 4, value: 3 },
        { questionNumber: 5, value: 3 },
        { questionNumber: 6, value: 3 },
        { questionNumber: 7, value: 3 },
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.hasCriticalItem).toBe(false);
      expect(result.criticalItems).toBeUndefined();
    });
  });

  describe('Validation', () => {
    it('should throw error for missing responses', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        // Missing questions 3-7
      ];

      expect(() => gad7Scorer.calculate(responses)).toThrow('Invalid response count');
    });

    it('should throw error for too many responses', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
        { questionNumber: 8, value: 1 }, // Extra question
      ];

      expect(() => gad7Scorer.calculate(responses)).toThrow('Invalid response count');
    });

    it('should throw error for duplicate question numbers', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 2, value: 2 }, // Duplicate
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
      ];

      expect(() => gad7Scorer.calculate(responses)).toThrow('Duplicate question numbers');
    });

    it('should throw error for missing question in sequence', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        // Missing question 4
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
        { questionNumber: 8, value: 1 },
      ];

      expect(() => gad7Scorer.calculate(responses)).toThrow();
    });
  });

  describe('Interpretation', () => {
    it('should provide minimal anxiety interpretation', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 0 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 0 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 0 },
        { questionNumber: 6, value: 0 },
        { questionNumber: 7, value: 0 },
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.interpretation).toContain('Minimal anxiety');
    });

    it('should include treatment recommendation for moderate', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 2 },
        { questionNumber: 2, value: 2 },
        { questionNumber: 3, value: 2 },
        { questionNumber: 4, value: 2 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.interpretation).toContain('Moderate anxiety');
      expect(result.interpretation).toContain('Treatment should be considered');
    });

    it('should include strong treatment recommendation for severe', () => {
      const responses: Response[] = [
        { questionNumber: 1, value: 3 },
        { questionNumber: 2, value: 3 },
        { questionNumber: 3, value: 3 },
        { questionNumber: 4, value: 3 },
        { questionNumber: 5, value: 3 },
        { questionNumber: 6, value: 3 },
        { questionNumber: 7, value: 0 },
      ];

      const result = gad7Scorer.calculate(responses);
      expect(result.interpretation).toContain('Severe anxiety');
      expect(result.interpretation).toContain('strongly recommended');
    });
  });

  describe('Boundary Cases', () => {
    it('should correctly classify boundary score 4-5', () => {
      const responses4: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 0 },
        { questionNumber: 6, value: 0 },
        { questionNumber: 7, value: 0 },
      ];

      const result4 = gad7Scorer.calculate(responses4);
      expect(result4.totalScore).toBe(4);
      expect(result4.severity).toBe('Minimal');

      const responses5: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 1 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 0 },
        { questionNumber: 7, value: 0 },
      ];

      const result5 = gad7Scorer.calculate(responses5);
      expect(result5.totalScore).toBe(5);
      expect(result5.severity).toBe('Mild');
    });

    it('should correctly classify boundary score 9-10', () => {
      const responses9: Response[] = [
        { questionNumber: 1, value: 1 },
        { questionNumber: 2, value: 1 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 2 },
        { questionNumber: 5, value: 2 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
      ];

      const result9 = gad7Scorer.calculate(responses9);
      expect(result9.totalScore).toBe(9);
      expect(result9.severity).toBe('Mild');

      const responses10: Response[] = [
        { questionNumber: 1, value: 2 },
        { questionNumber: 2, value: 2 },
        { questionNumber: 3, value: 1 },
        { questionNumber: 4, value: 2 },
        { questionNumber: 5, value: 1 },
        { questionNumber: 6, value: 1 },
        { questionNumber: 7, value: 1 },
      ];

      const result10 = gad7Scorer.calculate(responses10);
      expect(result10.totalScore).toBe(10);
      expect(result10.severity).toBe('Moderate');
    });
  });
});
