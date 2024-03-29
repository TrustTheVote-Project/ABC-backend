import { parseISO, format } from "date-fns";

export const formatTimeStamp = (
  date: string | Date | null | undefined
): string => {
  if (!date) {
    return "";
  }
  let dateObj = date;
  if (typeof dateObj === "string") {
    dateObj = dateFromISOString(dateObj);
  }
  return dateObj.toLocaleString();
};

export const formatLongDate = (
  date: string | Date | null | undefined
): string => {
  if (!date) {
    return "";
  }
  let dateObj = date;
  if (typeof dateObj === "string") {
    dateObj = dateFromISOString(dateObj);
  }
  return format(dateObj, "MMMM d, yyyy");
};

export const dateToYMD = (date: Date | null | undefined): string => {
  if (!date) {
    return "";
  }

  try {
    return date.toLocaleDateString();
  } catch (e) {
    console.log("Error formatting date", date);
    return "";
  }
};

export const dateFromISOString = (date: string): Date => {
  return parseISO(date);
};
