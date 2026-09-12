const API = 'https://back-clinic-test.xbrandev.dpdns.org';

describe('Dentists CRUD', () => {
  beforeEach(() => {
    cy.loginByLocalStorage();
    cy.intercept('GET', `${API}/dentists*`, { fixture: 'dentists.json' }).as('listDentists');
    cy.visit('/odontologos');
    cy.wait('@listDentists');
  });

  it('lists the seeded dentist', () => {
    cy.contains('strong', 'Dra. Ana Torres').should('be.visible');
  });

  it('creates a new dentist', () => {
    cy.intercept('POST', `${API}/dentists`, (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 'd2',
          full_name: req.body.full_name,
          license_number: req.body.license_number ?? null,
          specialties: req.body.specialties ?? [],
          color_hex: req.body.color_hex ?? null,
          bio: req.body.bio ?? null,
          work_schedule: req.body.work_schedule ?? [],
          schedule_exceptions: [],
          is_active: true,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      });
    }).as('createDentist');

    cy.contains('button', '+ Nuevo Odontologo').click();
    cy.get('input[name="fullName"]').type('Dr. Carlos Ruiz');
    cy.get('input[name="specialtiesText"]').type('Endodoncia, Ortodoncia');
    cy.get('form.dentist-form button[type="submit"]').click();

    cy.wait('@createDentist').its('request.body').should((body) => {
      expect(body.full_name).to.eq('Dr. Carlos Ruiz');
      expect(body.specialties).to.deep.equal(['Endodoncia', 'Ortodoncia']);
    });
  });

  it('edits an existing dentist', () => {
    cy.intercept('PUT', `${API}/dentists/d1`, (req) => {
      req.reply({ statusCode: 200, body: { ...req.body, id: 'd1', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' } });
    }).as('updateDentist');

    cy.contains('tr', 'Dra. Ana Torres').find('button[title="Editar"]').click();
    cy.get('input[name="licenseNumber"]').clear().type('COP-99999');
    cy.get('form.dentist-form button[type="submit"]').click();

    cy.wait('@updateDentist').its('request.body.license_number').should('eq', 'COP-99999');
  });

  it('deletes a dentist after confirming', () => {
    cy.intercept('DELETE', `${API}/dentists/d1`, { statusCode: 204 }).as('deleteDentist');

    cy.contains('tr', 'Dra. Ana Torres').find('button[title="Eliminar"]').click();
    cy.contains('button', 'Si, eliminar').click();

    cy.wait('@deleteDentist');
  });
});
