const API_BASE = '/api';

function getStoredToken() {
  return localStorage.getItem('studytrack_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('studytrack_token', token);
  } else {
    localStorage.removeItem('studytrack_token');
  }
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include' // allows HttpOnly cookies to pass
    });
  } catch (netErr) {
    console.error('Network request failed:', netErr);
    throw new Error('Cannot reach StudyTrack backend server. Please ensure the backend is running on port 5000 (run "npm start" or start-dev.bat).');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error || response.statusText || 'Request failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Authentication
export const authApi = {
  signup: (userData) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me')
};

// Tasks
export const tasksApi = {
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/tasks${queryString ? `?${queryString}` : ''}`);
  },
  getTaskById: (id) => request(`/tasks/${id}`),
  createTask: (taskData) => request('/tasks', { method: 'POST', body: JSON.stringify(taskData) }),
  updateTask: (id, taskData) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(taskData) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
};

// Reminders
export const remindersApi = {
  getReminders: () => request('/reminders'),
  markAsRead: (id) => request(`/reminders/${id}`, { method: 'PATCH' }),
  markAllAsRead: () => request('/reminders/read-all', { method: 'POST' })
};

// Study Sessions
export const studySessionsApi = {
  getSessions: (limit = 50) => request(`/study-sessions?limit=${limit}`),
  logSession: (sessionData) => request('/study-sessions', { method: 'POST', body: JSON.stringify(sessionData) })
};

// Analytics
export const analyticsApi = {
  getSummary: () => request('/analytics/summary'),
  getWeekly: () => request('/analytics/weekly'),
  getMonthly: () => request('/analytics/monthly')
};

// Goals & Streaks
export const goalsApi = {
  getGoals: () => request('/goals'),
  updateGoals: (goalsData) => request('/goals', { method: 'PUT', body: JSON.stringify(goalsData) })
};

// Settings
export const settingsApi = {
  getSettings: () => request('/settings'),
  updateSettings: (settingsData) => request('/settings', { method: 'PATCH', body: JSON.stringify(settingsData) })
};
