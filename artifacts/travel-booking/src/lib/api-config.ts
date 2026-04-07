// Configuration for API base URL
export const API_CONFIG = {
  // Backend API URL - change this if your backend runs on a different port
  BASE_URL: "http://localhost:3000",
  
  // Timeout for checking if backend is available (in ms)
  HEALTH_CHECK_TIMEOUT: 2000,
};

// Check if backend is available
export async function checkBackendAvailability(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.HEALTH_CHECK_TIMEOUT);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('⚠️ Backend not available, using mock data');
    return false;
  }
}
