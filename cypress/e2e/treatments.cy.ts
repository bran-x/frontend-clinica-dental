const API = 'https://back-clinic-test.xbrandev.dpdns.org';

describe('Treatments catalog CRUD', () => {
  beforeEach(() => {
    cy.loginByLocalStorage();
    cy.intercept('GET', `${API}/treatments*`, { fixture: 'treatments.json' }).as('listTreatments');
    cy.visit('/tratamientos');
    cy.wait('@listTreatments');
  });

  it('lists the seeded treatment', () => {
    cy.contains('strong', 'Limpieza dental').should('be.visible');
  });

  it('creates a new treatment', () => {
    cy.intercept('POST', `${API}/treatments`, (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 't2',
          ...req.body,
          is_active: true,
          created_at: '2024-01-02T00:00:00Z'
        }
      });
    }).as('createTreatment');

    cy.contains('button', '+ Nuevo Tratamiento').click();
    cy.get('input[name="category"]').type('Restaurativa');
    cy.get('input[name="name"]').type('Resina compuesta');
    cy.get('input[name="defaultPrice"]').type('90');
    cy.get('input[name="defaultDurationMinutes"]').type('40');
    cy.get('form.treatment-form button[type="submit"]').click();

    cy.wait('@createTreatment').its('request.body').should((body) => {
      expect(body.category).to.eq('Restaurativa');
      expect(body.name).to.eq('Resina compuesta');
      expect(body.default_price).to.eq(90);
      expect(body.default_duration_minutes).to.eq(40);
    });
  });

  it('edits an existing treatment', () => {
    cy.intercept('PUT', `${API}/treatments/t1`, (req) => {
      req.reply({ statusCode: 200, body: { ...req.body, id: 't1', created_at: '2024-01-01T00:00:00Z' } });
    }).as('updateTreatment');

    cy.contains('tr', 'Limpieza dental').find('button[title="Editar"]').click();
    cy.get('input[name="defaultPrice"]').clear().type('150');
    cy.get('form.treatment-form button[type="submit"]').click();

    cy.wait('@updateTreatment').its('request.body.default_price').should('eq', 150);
  });

  it('deletes a treatment after confirming', () => {
    cy.intercept('DELETE', `${API}/treatments/t1`, { statusCode: 204 }).as('deleteTreatment');

    cy.contains('tr', 'Limpieza dental').find('button[title="Eliminar"]').click();
    cy.contains('button', 'Si, eliminar').click();

    cy.wait('@deleteTreatment');
  });
});
