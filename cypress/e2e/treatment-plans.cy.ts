const API = 'https://back-clinic-test.xbrandev.dpdns.org';

describe('Treatment plans - total recalculation', () => {
  beforeEach(() => {
    cy.loginByLocalStorage();
    cy.intercept('GET', `${API}/patients*`, { fixture: 'patients.json' }).as('listPatients');
    cy.intercept('GET', `${API}/dentists*`, { fixture: 'dentists.json' }).as('listDentists');
    cy.intercept('GET', `${API}/treatments*`, { fixture: 'treatments.json' }).as('listTreatments');
    cy.intercept('GET', `${API}/treatment-plans*`, { fixture: 'treatment-plans.json' }).as('listPlans');
    cy.visit('/planes-tratamiento');
    cy.wait(['@listPatients', '@listDentists', '@listTreatments', '@listPlans']);
  });

  it('lists the seeded plan with its total', () => {
    cy.contains('td', 'Plan ortodoncia inicial').should('be.visible');
    cy.contains('td', 'S/').should('be.visible');
  });

  it('recalculates the running total in the form as items are added and edited', () => {
    cy.contains('button', '+ Nuevo Plan').click();
    cy.get('form.treatment-plan-form select[name="dentist_id"]').select('d1');
    cy.get('form.treatment-plan-form input[name="title"]').type('Plan de prueba');

    cy.contains('.items-total strong', 'S/ 0').should('exist');

    cy.contains('button', '+ Agregar item').click();
    cy.get('select[name="item_treatment_0"]').select('t1');
    cy.get('input[name="item_quantity_0"]').clear().type('2');
    cy.get('input[name="item_unit_price_0"]').clear().type('120.5');

    cy.contains('.items-total strong', 'S/ 241').should('exist');

    cy.get('input[name="item_quantity_0"]').clear().type('3');
    cy.contains('.items-total strong', 'S/ 361').should('exist');
  });

  it('creates a plan and sends the recalculated items to the backend', () => {
    cy.intercept('POST', `${API}/treatment-plans`, (req) => {
      req.reply({
        statusCode: 201,
        body: {
          id: 'tp2',
          patient_id: req.body.patient_id,
          dentist_id: req.body.dentist_id,
          title: req.body.title,
          items: req.body.items,
          status: 'proposed',
          total_estimated: req.body.items.reduce(
            (sum: number, item: { quantity: number; unit_price: number }) => sum + item.quantity * item.unit_price,
            0
          ),
          created_at: '2024-01-02T00:00:00Z'
        }
      });
    }).as('createPlan');

    cy.contains('button', '+ Nuevo Plan').click();
    cy.get('form.treatment-plan-form select[name="patient_id"]').select('p1');
    cy.get('form.treatment-plan-form select[name="dentist_id"]').select('d1');
    cy.get('form.treatment-plan-form input[name="title"]').type('Plan de prueba');
    cy.contains('button', '+ Agregar item').click();
    cy.get('select[name="item_treatment_0"]').select('t1');
    cy.get('input[name="item_quantity_0"]').clear().type('2');
    cy.get('input[name="item_unit_price_0"]').clear().type('100');
    cy.get('form.treatment-plan-form button[type="submit"]').click();

    cy.wait('@createPlan').its('request.body.items.0').should((item) => {
      expect(item.quantity).to.eq(2);
      expect(item.unit_price).to.eq(100);
    });
  });
});
