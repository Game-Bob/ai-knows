const UTILITY_PREFIX = 'jjlmoya-utils-';

export function findMatchingUtility(
    directoryNames: readonly string[],
    key: string
): string | undefined {
    const normalizedKey = key.trim().toLowerCase();

    return [...directoryNames]
        .sort((left, right) => left.localeCompare(right))
        .find((directoryName) => {
            const normalizedName = directoryName.toLowerCase();
            return (
                normalizedName.startsWith(UTILITY_PREFIX) &&
                normalizedName.slice(UTILITY_PREFIX.length).startsWith(normalizedKey)
            );
        });
}
