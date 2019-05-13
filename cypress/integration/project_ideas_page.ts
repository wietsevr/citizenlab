import { randomString } from '../support/commands';

describe('Project ideas page', () => {
  beforeEach(() => {
    cy.visit('/projects/an-idea-bring-it-to-your-council/ideas');
  });

  it('shows where you are', () => {
    cy.get('.e2e-projects-dropdown-link').should('have.class', 'active').should('be.visible');
    cy.get('.e2e-project-ideas-link').should('have.class', 'active').should('be.visible');
  });

  it('shows the list of idea cards', () => {
    cy.get('#e2e-ideas-container');
  });

  it('asks unauthorised users to log in or sign up before they vote', () => {
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().find('.upvote.enabled').click();
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').find('.e2e-login-button');
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').find('.e2e-register-button');
  });

  it('takes unauthorised users through signup and back to the page', () => {
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().find('.upvote.enabled').click();
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').find('.e2e-login-button').click();
    cy.location('pathname').should('eq', '/en-GB/sign-in');
  });

  it('takes you to the idea page when clicking an idea card', () => {
    cy.get('#e2e-ideas-container').find('.e2e-idea-card').first().as('ideaCard');
    cy.get('@ideaCard').then(($a) => {
      const href = $a.prop('href');
      cy.get('@ideaCard').click();
      cy.url().should('eq', href);
    });
  });
});