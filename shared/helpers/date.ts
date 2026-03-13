export const toISODate = (value: Date = new Date()): string => value.toISOString().split('T')[0];
