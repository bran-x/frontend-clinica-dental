const API = 'https://back-clinic-test.xbrandev.dpdns.org';

describe('Patients CRUD', () => {
  beforeEach(() => {
    cy.loginByLocalStorage();
    cy.intercept('GET', `${API}/patients*`, { fixture: 'patients.json' }).as('listPatients');
    cy.visit('/pacientes');
    cy.wait('@listPatients');
  });

  it('lists the seeded patient', () => {
    cy.contains('td', 'Gomez').should('be.visible');
  });

  it('creates a new patient', () => {
    cy.intercept('POST', `${API}/patients`, (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 'p2',
          ...req.body,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      });
    }).as('createPatient');

    cy.contains('button', '+ Nuevo Cliente').click();
    cy.get('input[name="dni"]').type('87654321');
    cy.get('input[name="firstName"]').type('Luis');
    cy.get('input[name="lastName"]').type('Ramirez');
    cy.get('form.patient-form button[type="submit"]').should('not.be.disabled').click();

    cy.wait('@createPatient').its('request.body').should((body) => {
      expect(body.first_name).to.eq('Luis');
      expect(body.last_name).to.eq('Ramirez');
      expect(body.document_id).to.eq('87654321');
    });
  });

  it('edits an existing patient', () => {
    cy.intercept('PUT', `${API}/patients/p1`, (req) => {
      req.reply({ statusCode: 200, body: { ...req.body, id: 'p1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' } });
    }).as('updatePatient');

    cy.contains('tr', 'Gomez').find('button[title="Editar"]').click();
    cy.get('input[name="phone"]').clear().type('999888777');
    cy.get('form.patient-form button[type="submit"]').click();

    cy.wait('@updatePatient').its('request.body.phone').should('eq', '999888777');
  });

  it('deletes a patient after confirming', () => {
    cy.intercept('DELETE', `${API}/patients/p1`, { statusCode: 204 }).as('deletePatient');

    cy.contains('tr', 'Gomez').find('button[title="Eliminar"]').click();
    cy.contains('button', 'Si, eliminar').click();

    cy.wait('@deletePatient');
  });
});
