// Export all services for easy importing
export * from './imageToVideoService';
export * from './textToImageService';
export { uploadImageToUrl as uploadImageForImageToImage } from './imageToImageService';
export * from './textToVideoService';
export * from './usageService';
export * from './plansService';
export * from './adminPlansService';
export * from './adminUsersService';
export * from './subscriptionService';
export * from './creditsService';
export * from './analyticsService';

// Export API base URL
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

