/// <reference types="cypress" />

const TOKEN_STORAGE_KEY = 'muelas_dent_access_token';
const AUTH_STORAGE_KEY = 'muelas_dent_auth_user';

export interface StubAuthUser {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'dentist' | 'staff';
}

/**
 * Seeds localStorage with a fake session so specs can land directly on a
 * guarded route without exercising the login form every time.
 */
Cypress.Commands.add('loginByLocalStorage', (user: StubAuthUser = {
  id: 'u1',
  name: 'Admin QA',
  username: 'admin',
  role: 'admin'
}) => {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, 'fake-e2e-token');
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginByLocalStorage(user?: StubAuthUser): Chainable<void>;
    }
  }
}

export {};
