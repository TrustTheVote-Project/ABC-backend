import { parseISO, format } from "date-fns"

export const formatTimeStamp = (date: string | Date | null | undefined): string => {
  if (!date) {
    return "";
  }
  let dateObj = date;
  if (typeof dateObj === "string") {
    dateObj =  dateFromISOString(dateObj);
  }
  return dateObj.toLocaleString()
}

export const formatLongDate = (date: string | Date | null | undefined): string => {
  if (!date) {
    return "";
  }
  let dateObj = date;
  if (typeof dateObj === "string") {
    dateObj =  dateFromISOString(dateObj);
  }
  return format(dateObj, "MMMM, d yyyy")
}

export const dateFromISOString = (date: string): Date => {
  return parseISO(date);
}