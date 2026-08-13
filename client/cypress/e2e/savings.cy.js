describe('Savings Goals', () => {
  beforeEach(() => {
    cy.login('ravi@example.com', 'Ravi@123');
  });

  it('creates a new savings goal', () => {
    cy.visit('/savings');
    cy.contains('New Goal').click();
    cy.get('input[placeholder="Goal title"]').type('Test Goal');
    cy.get('input[placeholder="Target amount"]').type('1000');
    cy.contains('Create').click();
    cy.contains('Test Goal').should('be.visible');
  });

  it('adds funds to a goal', () => {
    cy.visit('/savings');
    cy.contains('New Goal').click();
    cy.get('input[placeholder="Goal title"]').type('Goal for Funds');
    cy.get('input[placeholder="Target amount"]').type('500');
    cy.contains('Create').click();
    cy.contains('Goal for Funds').parent().find('button:contains("Add Funds")').click();
    cy.get('input[placeholder*="Amount"]').type('100');
    cy.contains('Add').click();
    cy.contains('Goal for Funds').parent().should('contain', '100');
  });

  it('shows goal progress', () => {
    cy.visit('/savings');
    cy.contains('New Goal').click();
    cy.get('input[placeholder="Goal title"]').type('Progress Goal');
    cy.get('input[placeholder="Target amount"]').type('1000');
    cy.contains('Create').click();
    cy.contains('Progress Goal').parent().should('contain', '0%');
  });

  it('deletes a goal', () => {
    cy.visit('/savings');
    cy.contains('New Goal').click();
    cy.get('input[placeholder="Goal title"]').type('Goal to Delete');
    cy.get('input[placeholder="Target amount"]').type('100');
    cy.contains('Create').click();
    cy.contains('Goal to Delete').parent().find('button[aria-label="Delete"]').click();
    cy.contains('Delete').click();
    cy.contains('Goal to Delete').should('not.exist');
  });
});