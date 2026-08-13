describe('Expense Tracker', () => {
  beforeEach(() => {
    cy.login('ravi@example.com', 'Ravi@123');
  });

  it('adds a new expense', () => {
    cy.visit('/expenses');
    cy.contains('Add Expense').click();
    cy.get('input[placeholder="Expense title"]').type('Test Expense');
    cy.get('input[placeholder="Amount"]').type('100');
    cy.contains('Add').click();
    cy.contains('Test Expense').should('be.visible');
  });

  it('edits an expense', () => {
    cy.visit('/expenses');
    cy.contains('Add Expense').click();
    cy.get('input[placeholder="Expense title"]').type('Expense to Edit');
    cy.get('input[placeholder="Amount"]').type('50');
    cy.contains('Add').click();
    cy.contains('Expense to Edit').parent().find('button[aria-label="Edit"]').click();
    cy.get('input[placeholder="Expense title"]').clear().type('Edited Expense');
    cy.contains('Update').click();
    cy.contains('Edited Expense').should('be.visible');
  });

  it('deletes an expense', () => {
    cy.visit('/expenses');
    cy.contains('Add Expense').click();
    cy.get('input[placeholder="Expense title"]').type('Expense to Delete');
    cy.get('input[placeholder="Amount"]').type('25');
    cy.contains('Add').click();
    cy.contains('Expense to Delete').parent().find('button[aria-label="Delete"]').click();
    cy.contains('Delete').click();
    cy.contains('Expense to Delete').should('not.exist');
  });

  it('filters expenses by category', () => {
    cy.visit('/expenses');
    cy.contains('Add Expense').click();
    cy.get('input[placeholder="Expense title"]').type('Food Expense');
    cy.get('input[placeholder="Amount"]').type('30');
    cy.get('select').eq(1).select('Food');
    cy.contains('Add').click();
    cy.get('select').eq(2).select('Food');
    cy.contains('Food Expense').should('be.visible');
  });

  it('searches expenses', () => {
    cy.visit('/expenses');
    cy.contains('Add Expense').click();
    cy.get('input[placeholder="Expense title"]').type('Unique Search Term');
    cy.get('input[placeholder="Amount"]').type('10');
    cy.contains('Add').click();
    cy.get('input[placeholder="Search..."]').type('Unique Search Term');
    cy.contains('Unique Search Term').should('be.visible');
  });
});