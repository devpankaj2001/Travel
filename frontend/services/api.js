const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Universal API fetch wrapper with token injection and error parsing
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, isFormData = false, headers = {} } = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders = { ...headers };

  // Attach token from localStorage if in browser
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers: requestHeaders
  };

  if (body) {
    if (isFormData) {
      // Browser sets multipart/form-data boundary automatically
      options.body = body;
    } else {
      requestHeaders['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If 401 Unauthorized, notify or clear session if token expired
      if (response.status === 401 && typeof window !== 'undefined') {
        if (endpoint !== '/auth/customer/login' && endpoint !== '/auth/supplier/login' && endpoint !== '/auth/admin/login') {
          // localStorage.removeItem('token');
          // localStorage.removeItem('user');
        }
      }
      return {
        success: false,
        status: response.status,
        message: result.message || 'An error occurred with this request',
        errors: result.errors || null
      };
    }

    return {
      success: true,
      status: response.status,
      ...result
    };
  } catch (error) {
    console.error(`[API Network Error] ${method} ${url}:`, error);
    return {
      success: false,
      status: 0,
      message: 'Unable to connect to backend server. Make sure the API is running at http://localhost:5000.'
    };
  }
}
