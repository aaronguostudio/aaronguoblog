/**
 * Date utility functions for consistent date handling across the application
 */

/**
 * Parse a date string in various formats
 * @param dateString - The date string to parse
 * @returns A Date object
 */
export function parseDate(dateString: string): Date {
  if (!dateString) {
    return new Date()
  }

  // Handle dates with ordinal indicators (1st, 2nd, 3rd, etc.)
  if (dateString.match(/\d+(st|nd|rd|th)/)) {
    return parseCustomDate(dateString)
  }

  // Try standard date parsing
  const date = new Date(dateString)

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date format: ${dateString}`)
    return new Date() // Return current date as fallback
  }

  return date
}

/**
 * Parse a date string with ordinal indicators (1st, 2nd, 3rd, etc.)
 * @param dateString - The date string to parse (e.g., "1st Jan 2023")
 * @returns A Date object
 */
export function parseCustomDate(dateString: string): Date {
  // Remove ordinal indicators (st, nd, rd, th)
  const cleanDateStr = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1')

  // Parse the date
  const date = new Date(cleanDateStr)

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid custom date format: ${dateString}`)
    return new Date() // Return current date as fallback
  }

  return date
}

/**
 * Format a date for display
 * @param dateString - The date string to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns A formatted date string
 */
export function formatDate(dateString: string, locale = 'en-US'): string {
  const date = parseDate(dateString)

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a date in ISO format (YYYY-MM-DD)
 * @param dateString - The date string to format
 * @returns A date string in ISO format
 */
export function formatISODate(dateString: string): string {
  const date = parseDate(dateString)

  return date.toISOString().split('T')[0]
}

/**
 * Sort an array of objects by date
 * @param array - The array to sort
 * @param dateField - The field containing the date string
 * @param ascending - Whether to sort in ascending order (default: false)
 * @returns The sorted array
 */
export function sortByDate<T>(array: T[], dateField: keyof T, ascending = false): T[] {
  return [...array].sort((a, b) => {
    const dateA = parseDate(a[dateField] as unknown as string).getTime()
    const dateB = parseDate(b[dateField] as unknown as string).getTime()

    return ascending ? dateA - dateB : dateB - dateA
  })
}
