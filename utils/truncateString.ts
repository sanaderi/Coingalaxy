export function truncateString(str: string, startLength: number, endLength: number): string {
    if (str.length <= startLength + endLength) {
        return str; // If the string is too short to truncate, return it as is.
    }

    const start = str.slice(0, startLength);
    const end = str.slice(-endLength);
    return `${start}......${end}`;
}