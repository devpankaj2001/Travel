import { apiRequest } from './api';

export const authService = {
  // -----------------------------------------------------------
  // Customer Auth
  // -----------------------------------------------------------
  async customerSignup(data) {
    return apiRequest('/auth/customer/signup', { method: 'POST', body: data });
  },

  async customerVerifyOtp(data) {
    const res = await apiRequest('/auth/customer/verify-otp', { method: 'POST', body: data });
    if (res.success && res.data?.tokens?.accessToken) {
      localStorage.setItem('token', res.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async customerResendOtp(data) {
    return apiRequest('/auth/customer/resend-otp', { method: 'POST', body: data });
  },

  async customerLogin(data) {
    const res = await apiRequest('/auth/customer/login', { method: 'POST', body: data });
    if (res.success && res.data?.tokens?.accessToken) {
      localStorage.setItem('token', res.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  // -----------------------------------------------------------
  // Supplier Auth
  // -----------------------------------------------------------
  async supplierSignup(data) {
    return apiRequest('/auth/supplier/signup', { method: 'POST', body: data });
  },

  async supplierVerifyOtp(data) {
    return apiRequest('/auth/supplier/verify-otp', { method: 'POST', body: data });
  },

  async supplierResendOtp(data) {
    return apiRequest('/auth/supplier/resend-otp', { method: 'POST', body: data });
  },

  async supplierVerifyEmail(data) {
    return apiRequest('/auth/supplier/verify-email', { method: 'POST', body: data });
  },

  async supplierLogin(data) {
    const res = await apiRequest('/auth/supplier/login', { method: 'POST', body: data });
    if (res.success && res.data?.tokens?.accessToken) {
      localStorage.setItem('token', res.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  // -----------------------------------------------------------
  // Admin Auth (Site Admin, Site Accountant, Finance)
  // -----------------------------------------------------------
  async adminLogin(data) {
    const res = await apiRequest('/auth/admin/login', { method: 'POST', body: data });
    if (res.success && res.data?.tokens?.accessToken) {
      localStorage.setItem('token', res.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  async adminRegister(data) {
    const res = await apiRequest('/auth/admin/register', { method: 'POST', body: data });
    if (res.success && res.data?.tokens?.accessToken) {
      localStorage.setItem('token', res.data.tokens.accessToken);
      localStorage.setItem('refreshToken', res.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  // -----------------------------------------------------------
  // Password Management
  // -----------------------------------------------------------
  async forgotPassword(email) {
    return apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
  },

  async resetPassword({ token, password }) {
    return apiRequest('/auth/reset-password', { method: 'POST', body: { token, password } });
  },

  // -----------------------------------------------------------
  // Profile & Current User
  // -----------------------------------------------------------
  async getProfile() {
    return apiRequest('/users/profile');
  },

  async updateProfile(data) {
    return apiRequest('/users/profile', { method: 'PUT', body: data });
  },

  async changePassword(data) {
    return apiRequest('/users/change-password', { method: 'PUT', body: data });
  },

  async getMe() {
    return apiRequest('/auth/me');
  },

  // -----------------------------------------------------------
  // Supplier Portal Operations
  // -----------------------------------------------------------
  async getSupplierProfile() {
    return apiRequest('/suppliers/profile');
  },

  async updateSupplierProfile(data) {
    return apiRequest('/suppliers/profile', { method: 'PUT', body: data });
  },

  async getSupplierStatus() {
    return apiRequest('/suppliers/status');
  },

  async uploadSupplierDocument(formData) {
    // If formData is plain object, send JSON; if FormData, send as multipart
    const isFD = typeof FormData !== 'undefined' && formData instanceof FormData;
    return apiRequest('/suppliers/documents', {
      method: 'POST',
      body: formData,
      isFormData: isFD
    });
  },

  async deleteSupplierDocument(documentId) {
    return apiRequest(`/suppliers/documents/${documentId}`, { method: 'DELETE' });
  },

  async submitSupplierVerification(data = {}) {
    return apiRequest('/suppliers/submit-verification', { method: 'POST', body: data });
  },

  async getSupplierEsign() {
    return apiRequest('/suppliers/esign');
  },

  async signSupplierEsign(data) {
    return apiRequest('/suppliers/esign/sign', { method: 'POST', body: data });
  },

  // -----------------------------------------------------------
  // Admin Operations (Roles, Permissions, Approvals, Reports)
  // -----------------------------------------------------------
  async getAdminRoles() {
    return apiRequest('/admin/roles');
  },

  async getAdminPermissions() {
    return apiRequest('/admin/permissions');
  },

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
  },

  async assignUserRole(userId, role_slug) {
    return apiRequest(`/admin/users/${userId}/role`, { method: 'PUT', body: { role_slug } });
  },

  async getAdminSuppliers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/suppliers${query ? `?${query}` : ''}`);
  },

  async getAdminSupplierDetail(supplierId) {
    return apiRequest(`/admin/suppliers/${supplierId}`);
  },

  async verifyAdminSupplierDocument(supplierId, docId, data) {
    return apiRequest(`/admin/suppliers/${supplierId}/documents/${docId}/verify`, { method: 'PUT', body: data });
  },

  async updateAdminSupplierStatus(supplierId, data) {
    return apiRequest(`/admin/suppliers/${supplierId}/status`, { method: 'PUT', body: data });
  },

  async approveSupplier(supplierId, notes) {
    return apiRequest(`/admin/suppliers/${supplierId}/approve`, { method: 'PUT', body: { notes } });
  },

  async rejectSupplier(supplierId, reason) {
    return apiRequest(`/admin/suppliers/${supplierId}/reject`, { method: 'PUT', body: { reason } });
  },

  async getRevenueReport() {
    return apiRequest('/admin/reports/revenue');
  },

  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  // -----------------------------------------------------------
  // Logout
  // -----------------------------------------------------------
  async logout() {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (refreshToken) {
      await apiRequest('/auth/logout', { method: 'POST', body: { refreshToken } });
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      try {
        return userStr ? JSON.parse(userStr) : null;
      } catch {
        return null;
      }
    }
    return null;
  }
};
