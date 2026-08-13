describe('Investments', () => {
  beforeEach(() => {
    cy.login('ravi@example.com', 'Ravi@123');
  });

  it('creates a new investment', () => {
    cy.visit('/wealth');
    cy.contains('Investments').click();
    cy.url().should('include', '/investments');
  });

  it('navigates to investments from dashboard', () => {
    cy.visit('/dashboard');
    cy.contains('View Analytics').click();
    cy.url().should('include', '/wealth');
  });
});

describe('Debts', () => {
  beforeEach(() => {
    cy.login('ravi@example.com', 'Ravi@123');
  });

  it('navigates to debts page', () => {
    cy.visit('/debts');
    cy.contains('Debts').should('be.visible');
  });
});