import { detectSqlInjection, sanitizeInput, sanitizeObject } from '@/lib/sanitize';

describe('sanitize helpers', () => {
  it('strips dangerous HTML', () => {
    const result = sanitizeInput('<script>alert("x")</script>Hello');
    expect(result).toBe('Hello');
  });

  it('deeply sanitizes objects and arrays', () => {
    const raw = { name: '<b>Alice</b>', tags: ['<i>art</i>', 'clean'], meta: { note: '<u>hi</u>' } };
    const sanitized = sanitizeObject(raw);
    expect(sanitized).toEqual({ name: 'Alice', tags: ['art', 'clean'], meta: { note: 'hi' } });
  });

  it('detects SQL injection patterns and passes clean input', () => {
    expect(detectSqlInjection(["' OR 1=1 --"])).toContain("' OR 1=1 --");
    expect(detectSqlInjection(['safe value', 42, true])).toBeNull();
  });
});
