const API = 'https://back-clinic-test.xbrandev.dpdns.org';

describe('Login', () => {
  it('logs in with valid credentials and redirects to patients', () => {
    cy.intercept('POST', `${API}/auth/login`, {
      statusCode: 200,
      body: { access_token: 'fake-token', token_type: 'bearer' }
    }).as('login');
    cy.intercept('GET', `${API}/auth/me`, {
      statusCode: 200,
      body: { id: 'u1', username: 'admin', full_name: 'Admin QA', role: 'admin' }
    }).as('me');
    cy.intercept('GET', `${API}/patients*`, { statusCode: 200, body: [] }).as('patients');

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('secret');
    cy.get('.submit-button').click();

    cy.wait('@login');
    cy.wait('@me');
    cy.location('pathname').should('eq', '/pacientes');
  });

  it('shows a friendly error and stays on the page with invalid credentials', () => {
    cy.intercept('POST', `${API}/auth/login`, { statusCode: 401, body: { detail: 'Incorrect credentials' } }).as(
      'login'
    );

    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('wrong');
    cy.get('.submit-button').click();

    cy.wait('@login');
    cy.contains('.error', 'Usuario o contrasena incorrectos').should('be.visible');
    cy.location('pathname').should('eq', '/auth/login');
  });
});
