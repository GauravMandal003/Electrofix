// src/api/apiClient.js - Centralized API client for ElectroFix
/**
 * A standard wrapper around fetch for secure and unified request handling.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('ef_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!response.ok) {
    const errorData = isJson ? await response.json().catch(() => ({})) : {};
    throw new Error(errorData.error || `API request failed (${response.status})`);
  }

  if (!isJson) {
    throw new Error('Server returned non-JSON response');
  }

  return response.json();
}
