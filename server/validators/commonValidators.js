export const requireNumber = (value, fieldName) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    const error = new Error(`${fieldName} must be a valid number`);
    error.status = 400;
    throw error;
  }
};
