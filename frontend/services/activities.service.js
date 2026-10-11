import { apiRequest } from './api';

export const activitiesService = {
  /**
   * Fetch activities with query parameters (search, city, category, minPrice, maxPrice, duration, sort, page, limit)
   */
  async getActivities(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const endpoint = queryString ? `/activities?${queryString}` : '/activities';
    return apiRequest(endpoint);
  },

  /**
   * Fetch single activity by ID
   */
  async getActivityById(id) {
    return apiRequest(`/activities/${id}`);
  },

  /**
   * Fetch all locations/destinations with activity count and starting prices
   */
  async getLocations() {
    return apiRequest('/activities/locations');
  },

  /**
   * Fetch all activity categories with counts
   */
  async getCategories() {
    return apiRequest('/activities/categories');
  }
};
