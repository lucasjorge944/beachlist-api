export class DateUtils {
  static getYear(date): number {
    return date.getFullYear()
  }

  static getMonthZeroLeft(date: Date): string {
    const month = date.getMonth() + 1

    return month.toString().padStart(2, '0')
  }

  static getMonth(date: Date): string {
    const month = date.getMonth() + 1

    return month.toString()
  }

  static startOfNextMonth(date: Date): Date {
    let nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1)
    return nextMonth
  }

  static getPrevDate(year: string, month: number): { year: number; month: number } {
    const response = {
      month: 0,
      year: Number(year)
    }

    if (month == 1) {
      response.month = 12
      response.year = Number(year) - 1

      return response
    }

    response.month = month - 1

    return response
  }
}
