import { User } from '@masterthesis/shared';

import { showNotificationWithIcon } from '../utils/form';
import { API_URL, client } from './apollo-client';

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
  await resetCache();
};

export const resetCache = () => client.cache.reset();

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

    showNotificationWithIcon({
      title: `Hello ${user.firstName}`,
      icon: 'success',
      content: 'Registration successful.'
    });

    return user;
  } catch (err) {
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
      showNotificationWithIcon({
        content: 'The login has failed.',
        icon: 'error',
        title: 'Login failed'
      });
      return null;
    }

    const user: User = await res.json();

    showNotificationWithIcon({
      title: `Hello ${user.firstName}`,
      icon: 'success',
      content: 'Login successful.'
    });

    return user;
  } catch (err) {
    showNotificationWithIcon({
      content: 'Unknown error',
      icon: 'error',
      title: 'Login failed because of unknown reason'
    });
  }

  return null;
};
