const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000';

export const parseJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const base = token.split('.')[1];
    const json = decodeURIComponent(
      Array.prototype.map
        .call(window.atob(base), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  // Deduplicate concurrent refresh requests by reusing the same in-flight promise
  if ((refreshAccessToken as any)._inFlight) {
    return (refreshAccessToken as any)._inFlight;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        return data.access_token;
      }
    } catch (e) {
      console.error('refresh error', e);
    }
    return null;
  })();

  (refreshAccessToken as any)._inFlight = promise;
  try {
    const result = await promise;
    return result;
  } finally {
    // clear in-flight so future refreshes are possible
    (refreshAccessToken as any)._inFlight = null;
  }
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}), 'Content-Type': 'application/json' };
  const token = localStorage.getItem('access_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: options.credentials ?? 'include' });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: options.credentials ?? 'include' });
    }
  }
  return res;
};

export default API_BASE;
