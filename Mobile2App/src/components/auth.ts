
export type User = {
  id: number;
  username: string;
  password: string;
  role: string;
};

let loggedInUser: User | null = null;
const listeners: Array<(user: User | null) => void> = [];

export const setCurrentUser = (user: User | null) => {
  loggedInUser = user;
  listeners.forEach(listener => listener(loggedInUser));
};

export const getCurrentUser = () => loggedInUser;

export const logout = () => {
  setCurrentUser(null);
};

export const logoutUser = () => {
  logout();
};

export const subscribeAuth = (
  listener: (user: User | null) => void,
) => {
  listeners.push(listener);

  return () => {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
};
