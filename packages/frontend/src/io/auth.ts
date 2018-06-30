import { showNotificationWithIcon } from '../utils/form';

const SESSION_KEY = 'SESSION_ACTIVE';

export const isLoggedIn = () => localStorage.getItem(SESSION_KEY) === 'true';

const setLoggedIn = (value: boolean) => {
  localStorage.setItem(SESSION_KEY, value ? 'true' : '');
};

export const logout = async () => {
  await fetch('http://localhost:3000/logout', {
    cache: 'no-cache',
    credentials: 'include',
    headers: {},
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    referrer: 'no-referrer'
  });
  setLoggedIn(false);
};

export const register = async (name: string, mail: string, pw: string) => {
  try {
    await fetch('http://localhost:3000/register', {
      body: JSON.stringify({
        name,
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

    setLoggedIn(true);
    showNotificationWithIcon({
      content: 'Welcome.',
      icon: 'success',
      title: 'Registration successful.'
    });
  } catch (err) {
    setLoggedIn(false);

    showNotificationWithIcon({
      content: 'Unknown error',
      icon: 'error',
      title: 'Registration failed because of unknown reason'
    });
  }
};

export const login = async (mail: string, pw: string) => {
  try {
    const res = await fetch('http://localhost:3000/login', {
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
      return;
    }

    setLoggedIn(true);
    showNotificationWithIcon({
      content: 'You are now logged in.',
      icon: 'success',
      title: 'Login successful'
    });
  } catch (err) {
    setLoggedIn(false);
    showNotificationWithIcon({
      content: 'Unknown error',
      icon: 'error',
      title: 'Login failed because of unknown reason'
    });
  }
};
