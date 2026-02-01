export function getMonthAndYear(dateStr: string): { month: number; year: number } {
    const [dayStr, monthStr, yearStr] = dateStr.split('-');

    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1; // JS months: 0-11
    const year = parseInt(yearStr, 10);

    const date = new Date(year, month, day);

    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
    }

    return {
        month: date.getMonth() + 1,
        year: date.getFullYear(),
    };
}
