describe('Habit Tracker', () => {
  beforeEach(() => {
    cy.login('ravi@example.com', 'Ravi@123');
  });

  it('creates a new habit', () => {
    cy.visit('/habits');
    cy.contains('New Habit').click();
    cy.get('input[placeholder*="Save"]').type('Test Habit');
    cy.contains('Create Habit').click();
    cy.contains('Test Habit').should('be.visible');
  });

  it('completes a habit', () => {
    cy.visit('/habits');
    cy.contains('New Habit').click();
    cy.get('input[placeholder*="Save"]').type('Habit to Complete');
    cy.contains('Create Habit').click();
    cy.contains('Habit to Complete').parent().find('button:contains("Complete today")').click();
    cy.contains('Done today').should('be.visible');
  });

  it('shows streak counter', () => {
    cy.visit('/habits');
    cy.contains('New Habit').click();
    cy.get('input[placeholder*="Save"]').type('Streak Habit');
    cy.contains('Create Habit').click();
    cy.contains('Streak Habit').parent().should('contain', 'streak');
  });

  it('deletes a habit', () => {
    cy.visit('/habits');
    cy.contains('New Habit').click();
    cy.get('input[placeholder*="Save"]').type('Habit to Delete');
    cy.contains('Create Habit').click();
    cy.contains('Habit to Delete').parent().find('button[aria-label="Delete"]').click();
    cy.contains('Delete').click();
    cy.contains('Habit to Delete').should('not.exist');
  });
});