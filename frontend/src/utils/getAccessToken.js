
function getAccessTokenFromCookie() {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [key, value] = cookie.split('=');
      if (key === 'accessToken') {
        return value;
      }
    }
    return null; // Access token not found
  }
export default getAccessTokenFromCookie;