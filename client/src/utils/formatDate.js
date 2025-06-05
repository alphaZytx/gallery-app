import { format, parseISO } from 'date-fns';

/**
 * Formats an ISO date string into a more readable format.
 * @param {string} dateString - The ISO date string.
 * @param {string} formatString - The desired date-fns format string.
 * @returns {string} The formatted date string or 'Invalid Date' if parsing fails.
 */
export const formatDate = (dateString, formatString = "MMMM d, yyyy 'at' h:mm a") => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Invalid Date';
  }
};

export const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null || isNaN(parseInt(bytes))) return 'N/A';
    const b = parseInt(bytes, 10);
    if (b === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    if (i < 0 || i >= sizes.length) return 'N/A'; // Handle edge cases for very small/large numbers
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};