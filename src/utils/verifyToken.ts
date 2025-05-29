import Cookies from 'js-cookie';

export const getAccessToken = () => {
  return Cookies.get('token');
};

export const isLoggedIn = (): boolean => {
  const token = getAccessToken();
  return !!token;
};
