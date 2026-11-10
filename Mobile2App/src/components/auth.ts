import { User } from './database';

let loggedInUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  loggedInUser = user;
};

export const getCurrentUser = () => loggedInUser;

export const logout = () => {
  loggedInUser = null;
};