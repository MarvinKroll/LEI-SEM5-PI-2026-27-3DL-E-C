import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchHealth } from './api';

describe('Health Check API Client (Frontend Skeleton)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return ok: true when backend health returns status ok', async () => {
    const mockResponse = {
      status: 'ok',
      version: '1.0.0',
      timestamp: '2026-10-02T11:00:00.000Z',
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchHealth();

    expect(result.ok).toBe(true);
    expect(result.data?.status).toBe('ok');
    expect(result.data?.version).toBe('1.0.0');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should return ok: false when backend is unreachable or throws an error', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('Failed to fetch'));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchHealth();

    expect(result.ok).toBe(false);
    expect(result.error).toContain('Failed to fetch');
  });
});
