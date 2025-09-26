function getAllCookies() {
  const cookies: { [key: string]: string } = {};

  if (!document.cookie) {
    return null;
  }

  document.cookie.split('; ').forEach((cookie) => {
    const [key, value] = cookie.split('=');
    cookies[key] = decodeURIComponent(value);
  });

  return cookies;
}

function setCookie(key: string, value: string, exminutes?: number | null) {
  const expired = new Date();
  if (exminutes != null) {
    expired.setTime(expired.getTime() + exminutes * 60 * 1000);
  }

  const newValue =
    value +
    (expired == null ? '' : ';expires=' + expired.toUTCString() + ';Secure;SameSite:Lax;path=/');
  document.cookie = key + '=' + newValue;
}

function getCookie(key: string) {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + key.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function deleteCookie(key: string) {
  document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
}

export { setCookie, getCookie, getAllCookies, deleteCookie };
