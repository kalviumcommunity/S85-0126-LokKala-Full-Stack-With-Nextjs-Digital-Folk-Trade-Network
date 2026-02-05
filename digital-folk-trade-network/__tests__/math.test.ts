import { add, average } from '@/utils/math';

describe('math utilities', () => {
  it('adds two numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 5)).toBe(4);
  });

  it('calculates average safely', () => {
    expect(average([2, 4, 6])).toBe(4);
    expect(average([])).toBe(0);
  });
});
