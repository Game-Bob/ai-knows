import { describe, expect, it } from 'vitest';
import { findMatchingUtility } from '../src/dev-resolver.js';

describe('findMatchingUtility', () => {
    const utilities = [
        'jjlmoya-utils-audiovisual',
        'jjlmoya-utils-audio-tools',
        'jjlmoya-utils-games-development',
        'jjlmoya-utils-games'
    ];

    it('returns the first alphabetical prefix match', () => {
        expect(findMatchingUtility(utilities, 'audio')).toBe('jjlmoya-utils-audio-tools');
    });

    it('matches utility names without caring about case or surrounding spaces', () => {
        expect(findMatchingUtility(utilities, '  AUDIOVISUAL ')).toBe('jjlmoya-utils-audiovisual');
    });

    it('returns undefined when no utility matches', () => {
        expect(findMatchingUtility(utilities, 'music')).toBeUndefined();
    });
});
