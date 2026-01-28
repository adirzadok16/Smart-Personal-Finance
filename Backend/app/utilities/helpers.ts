export function getMonthAndYear(dateStr: string): { month: number; year: number } {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid date: ${dateStr}`);
        }

        return {
            month: date.getMonth() + 1,
            year: date.getFullYear(),
        };
    }