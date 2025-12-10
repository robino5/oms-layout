// src/utils/cookieUtils.ts

/**
 * Set a cookie
 * @param name - cookie name
 * @param value - cookie value (any type)
 * @param days - expiration in days (default: 7)
 */
export const setCookie = (name: string, value: any, days: number = 7): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${JSON.stringify(value)};${expires};path=/`;
};

/**
 * Get a cookie by name
 * @param name - cookie name
 * @returns the parsed cookie value, or null if not found
 */
export const getCookie = (name: string): any | null => {
  const cookieName = name + "=";
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      try {
        return JSON.parse(cookie.substring(cookieName.length));
      } catch (error) {
        console.error("Failed to parse cookie", error);
        return null;
      }
    }
  }

  return null;
};
