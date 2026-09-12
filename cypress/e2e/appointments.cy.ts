const API = 'https://back-clinic-test.xbrandev.dpdns.org';

describe('Appointments CRUD', () => {
  beforeEach(() => {
    cy.loginByLocalStorage();
    cy.intercept('GET', `${API}/patients*`, { fixture: 'patients.json' }).as('listPatients');
    cy.intercept('GET', `${API}/dentists*`, { fixture: 'dentists.json' }).as('listDentists');
    cy.intercept('GET', `${API}/appointments*`, { fixture: 'appointments.json' }).as('listAppointments');
    cy.visit('/citas');
    cy.wait(['@listPatients', '@listDentists', '@listAppointments']);
  });

  it('lists the seeded appointment', () => {
    cy.contains('td', 'Ana Gomez').should('be.visible');
  });

  it('creates a new appointment', () => {
    cy.intercept('POST', `${API}/appointments`, (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 'a2',
          patient_id: req.body.patient_id,
          dentist_id: req.body.dentist_id,
          dentist_name: 'Dra. Ana Torres',
          starts_at: req.body.starts_at,
          duration_minutes: req.body.duration_minutes,
          reason: req.body.reason,
          status: 'scheduled',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      });
    }).as('createAppointment');

    cy.contains('button', '+ Nueva Cita').click();
    cy.get('input[name="starts_at"]').type('2024-06-05T09:00');
    cy.get('input[name="duration_minutes"]').clear().type('45');
    cy.get('textarea[name="reason"]').type('Control de rutina');
    cy.get('form.appointment-form button[type="submit"]').click();

    cy.wait('@createAppointment').its('request.body').should((body) => {
      expect(body.reason).to.eq('Control de rutina');
      expect(body.duration_minutes).to.eq(45);
    });
  });

  it('surfaces a 409 double-booking conflict without closing the form', () => {
    cy.intercept('POST', `${API}/appointments`, {
      statusCode: 409,
      body: { detail: 'El odontologo ya tiene una cita en ese horario.' }
    }).as('createConflict');

    cy.contains('button', '+ Nueva Cita').click();
    cy.get('input[name="starts_at"]').type('2024-06-01T10:00');
    cy.get('input[name="duration_minutes"]').clear().type('30');
    cy.get('textarea[name="reason"]').type('Doble reserva');
    cy.get('form.appointment-form button[type="submit"]').click();

    cy.wait('@createConflict');
    cy.get('.form-error').should('contain.text', 'Ya existe una cita');
    cy.get('form.appointment-form').should('be.visible');
  });

  it('deletes an appointment after confirming', () => {
    cy.intercept('DELETE', `${API}/appointments/a1`, { statusCode: 204 }).as('deleteAppointment');

    cy.contains('tr', 'Ana Gomez').find('button[title="Eliminar"]').click();
    cy.contains('button', 'Eliminar').click();

    cy.wait('@deleteAppointment');
  });
});
