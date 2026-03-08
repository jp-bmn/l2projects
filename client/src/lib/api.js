const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

async function apiCall(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export const api = {
  send: (data) => apiCall('POST', '/api/send', data),
  getInbox: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiCall('GET', `/api/inbox${qs ? '?' + qs : ''}`);
  },
  updateMessage: (id, data) => apiCall('PATCH', `/api/inbox/${id}`, data),
  getUsage: () => apiCall('GET', '/api/usage'),
  getUsageHistory: () => apiCall('GET', '/api/usage/history'),
  getBudget: () => apiCall('GET', '/api/budget'),
  setBudget: (data) => apiCall('POST', '/api/budget', data),
  getActivity: (limit = 50) => apiCall('GET', `/api/activity?limit=${limit}`),
  getRates: () => apiCall('GET', '/api/rates'),
  simulateInbound: (data = {}) => apiCall('POST', '/api/simulate-inbound', data),
  resetSeed: () => apiCall('POST', '/api/dev/reset-seed'),
};
