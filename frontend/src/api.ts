export interface HealthStatus {
  status: string;
  version?: string;
  timestamp?: string;
}

export async function fetchHealth(): Promise<{ ok: boolean; data?: HealthStatus; error?: string }> {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';
  try {
    const response = await fetch(`${baseUrl}/health`);
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    const data: HealthStatus = await response.json();
    return { ok: data.status === 'ok', data };
  } catch (err: any) {
    return { ok: false, error: err.message || 'Network error' };
  }
}
