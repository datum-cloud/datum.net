function setCookie(key: string, value: string, exdays?: number | null) {
  const exdate = new Date();
  if (exdays != null) {
    exdate.setDate(exdate.getDate() + exdays);
  }
  const newValue = value + (exdays == null ? '' : ';expires=' + exdate.toUTCString());
  document.cookie = key + '=' + newValue;
}

function getCookie(name: string) {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export { setCookie, getCookie };
