// Utility functions for authentication

export const login = (token: string, userInfo?: any) => {
  localStorage.setItem("token", token);
  if (userInfo) {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }
  // ส่ง custom event เพื่อแจ้งการเปลี่ยนแปลงให้ Nav component
  window.dispatchEvent(new Event("authChange"));
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  // ส่ง custom event เพื่อแจ้งการเปลี่ยนแปลงให้ Nav component
  window.dispatchEvent(new Event("authChange"));
};

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

export const getUserInfo = () => {
  if (typeof window === "undefined") return null;
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Helper to create Authorization header
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
