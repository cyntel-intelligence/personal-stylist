import { getAuth } from 'firebase/auth';

/**
 * Make an authenticated API request
 * Automatically adds Firebase ID token to Authorization header
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated. Please sign in.');
  }

  // Get fresh ID token
  const token = await user.getIdToken();

  // Merge headers with authorization
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  // Make the request
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Helper for POST requests with JSON body
 */
export async function authenticatedPost<T = any>(
  url: string,
  data: any
): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Helper for GET requests
 */
export async function authenticatedGet<T = any>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Helper for PUT requests
 */
export async function authenticatedPut<T = any>(
  url: string,
  data: any
): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Helper for DELETE requests
 */
export async function authenticatedDelete<T = any>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.message || error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
