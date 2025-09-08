function truncate(str = '', maxChar = 100, suffix = '...'): string {
  return str.length < maxChar
    ? str
    : `${str.substr(0, str.substr(0, maxChar - suffix.length).lastIndexOf(' '))}${suffix}`;
}

export { truncate };
