export const add = (a: number, b: number): number => a + b;

export const average = (values: number[]): number => {
  if (!values.length) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
};
