import { User } from '@masterthesis/shared';

import { showNotificationWithIcon } from '../utils/form';
import { API_URL, client } from './apollo-client';

const SESSION_KEY = 'SESSION_ACTIVE';

export const isLoggedIn = () => localStorage.getItem(SESSION_KEY) === 'true';

const setLoggedIn = (value: boolean) => {
  localStorage.setItem(SESSION_KEY, value ? 'true' : '');
};

export const logout = async () => {
  await fetch(`${API_URL}/logout`, {
    cache: 'no-cache',
    credentials: 'include',
    headers: {},
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    referrer: 'no-referrer'
  });
  await client.cache.reset();
  setLoggedIn(false);
};

export const register = async (
  firstName: string,
  lastName: string,
  mail: string,
  pw: string
): Promise<User | null> => {
  try {
    const res = await fetch(`${API_URL}/registration`, {
      body: JSON.stringify({
        firstName,
        lastName,
        mail,
        pw
      }),
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'no-referrer'
    });

    const user: User = await res.json();

    setLoggedIn(true);
    showNotificationWithIcon({
      title: `Hello ${user.firstName}`,
      icon: 'success',
      content: 'Registration successful.'
    });

    return user;
  } catch (err) {
    setLoggedIn(false);

    showNotificationWithIcon({
      content:
        'Registration has failed. Maybe the email address is already used.',
      icon: 'error',
      title: 'Registration failed'
    });
  }

  return null;
};

export const login = async (mail: string, pw: string): Promise<User | null> => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      body: JSON.stringify({ mail, pw }),
      cache: 'no-cache',
      credentials: 'include',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'no-referrer'
    });
    if (res.status === 401) {
      setLoggedIn(false);
      showNotificationWithIcon({
        content: 'The login has failed.',
        icon: 'error',
        title: 'Login failed'
      });
      return null;
    }

    const user: User = await res.json();

    setLoggedIn(true);
    showNotificationWithIcon({
      title: `Hello ${user.firstName}`,
      icon: 'success',
      content: 'Login successful.'
    });

    return user;
  } catch (err) {
    setLoggedIn(false);
    showNotificationWithIcon({
      content: 'Unknown error',
      icon: 'error',
      title: 'Login failed because of unknown reason'
    });
  }

  return null;
};
