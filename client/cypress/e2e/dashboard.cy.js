describe('Dashboard', () => {
  beforeEach(() => {
    cy.login('ravi@example.com', 'Ravi@123');
  });

  it('loads and shows summary cards', () => {
    cy.visit('/dashboard');
    cy.contains(/monthly (income|expense)/i, { timeout: 10000 }).should('be.visible');
    cy.contains(/net worth/i).should('be.visible');
    cy.contains(/savings rate/i).should('be.visible');
  });

  it('navigates to expense tracker', () => {
    cy.visit('/dashboard');
    cy.contains('Expenses').click();
    cy.url().should('include', '/expenses');
  });
});
