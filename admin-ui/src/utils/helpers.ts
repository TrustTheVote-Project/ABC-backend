export function hasNonEmptyValues(obj: object | null): boolean {
  if (obj) {
    return Object.entries(obj).some(([key, value]) => {
      if (typeof value === 'object') {
        return hasNonEmptyValues(value);
      } else {
        return value !== undefined && value !== null && value !== '';
      }
    });
  } else {
    return false;
  }
  
}
