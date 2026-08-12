const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

/** Turn /uploads/... paths into absolute URLs when API is on another host. */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads') && API_ORIGIN) return `${API_ORIGIN}${url}`;
  return url;
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    sessionStorage.setItem('asnafi_access_token', token);
  } else {
    sessionStorage.removeItem('asnafi_access_token');
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  return sessionStorage.getItem('asnafi_access_token');
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.accessToken) {
      setAccessToken(data.accessToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && retry && !path.includes('/auth/')) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiFetch(path, options, false);
    setAccessToken(null);
  }

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    const message =
      (data as { message?: string | string[] })?.message ??
      res.statusText;
    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : String(message),
      res.status,
      data,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getGoogleAuthUrl(redirect?: string) {
  const base = `${API_BASE}/auth/google`;
  if (redirect) {
    return `${base}?redirect=${encodeURIComponent(redirect)}`;
  }
  return base;
}

export function clearLegacyStorage() {
  const keys = [
    'menucraft_users',
    'menucraft_current_user',
    'menucraft_info',
    'menucraft_categories',
    'menucraft_plans',
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}
