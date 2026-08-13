describe('Settings', () => {
  beforeEach(() => {
    cy.login('ravi@example.com', 'Ravi@123');
  });

  it('updates profile information', () => {
    cy.visit('/settings');
    cy.contains('Edit Profile').click();
    cy.get('input[placeholder*="Software Engineer"]').clear().type('Updated Occupation');
    cy.contains('Save Profile').click();
    cy.contains('Profile updated').should('be.visible');
    cy.contains('Updated Occupation').should('be.visible');
  });

  it('changes password', () => {
    cy.visit('/settings');
    cy.get('input[id="settings-current-password"]').type('Ravi@123');
    cy.get('input[id="settings-new-password"]').type('NewPass@123');
    cy.get('input[id="settings-confirm-password"]').type('NewPass@123');
    cy.contains('Update Password').click();
    cy.contains('Password updated').should('be.visible');
  });

  it('exports data', () => {
    cy.visit('/settings');
    cy.contains('Export Data').click();
    cy.contains('Exported!').should('be.visible');
  });

  it('toggles dark mode', () => {
    cy.visit('/settings');
    cy.get('button[aria-label*="theme"]').click();
    cy.get('html').should('have.class', 'dark');
  });
});