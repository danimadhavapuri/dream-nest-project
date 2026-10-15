/**
 * Centralized API configuration and asset helpers for Dream Nest
 */

export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

/**
 * Safely constructs a valid URL for images uploaded to the server
 * Handles Windows backslashes, Unix forward slashes, and leading paths
 */
export const getImageUrl = (photoPath, defaultFallback = "/assets/uploadPhoto.png") => {
  if (!photoPath) return defaultFallback;

  // If already a full external URL (e.g. cloudinary / s3 / placeholder)
  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }

  // If starting with data: URI (preview before upload)
  if (photoPath.startsWith("data:") || photoPath.startsWith("blob:")) {
    return photoPath;
  }

  // Normalize Windows backslashes
  let cleanPath = photoPath.replace(/\\/g, "/");

  // Remove leading "public/" or "/public/"
  cleanPath = cleanPath.replace(/^\/?public\/?/, "/");

  // Ensure leading slash
  if (!cleanPath.startsWith("/")) {
    cleanPath = "/" + cleanPath;
  }

  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Helper to fetch API with auto-json parsing and token attachment
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    ...(!options.isFormData && { "Content-Type": "application/json" }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText || "Something went wrong";
    throw new Error(errorMsg);
  }

  return data;
};
