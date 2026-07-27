describe('Authentication', () => {
  it('shows login form', () => {
    cy.visit('/login');
    cy.contains('Sign In').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('shows validation errors for empty form', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.contains(/required|invalid/i).should('be.visible');
  });
});
