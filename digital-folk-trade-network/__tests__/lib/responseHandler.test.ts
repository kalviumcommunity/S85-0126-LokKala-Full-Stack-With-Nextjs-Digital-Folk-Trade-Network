/** @jest-environment jsdom */
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((payload: unknown, init?: ResponseInit) => ({
      status: init?.status ?? 200,
      async json() {
        return payload;
      },
    })),
  },
}));

import { ERROR_CODES, sendError, sendSuccess } from '@/lib/responseHandler';

describe('response handler', () => {
  it('returns success response with data', async () => {
    const res = sendSuccess({ ok: true }, 'Done', 201);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe('Done');
    expect(body.data).toEqual({ ok: true });
  });

  it('returns error response with code and details', async () => {
    const res = sendError('Bad', ERROR_CODES.BAD_REQUEST, 400, { reason: 'invalid' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe(ERROR_CODES.BAD_REQUEST);
    expect(body.error.details).toEqual({ reason: 'invalid' });
  });
});
