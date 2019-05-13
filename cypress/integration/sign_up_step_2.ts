import { randomString, randomEmail } from '../support/commands';

describe('Sign up step 2 page', () => {

  const navigateToLandingPage = () => {
    cy.wait(1000);
    cy.visit('/');
    cy.wait(1000);
    cy.get('#e2e-landing-page');
    cy.wait(1000);
  };

  describe('No custom fields', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    before(() => {
      cy.apiSignup(firstName, lastName, email, password);
      cy.login(email, password);
    });

    it('does not show it when no custom fields are enabled', () => {
      cy.visit('/complete-signup').wait(1000);
      cy.location('pathname').should('eq', '/en-GB/');
      cy.get('#e2e-landing-page');
    });
  });

  describe('Optional custom field', () => {
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let customFieldId: string;

    before(() => {
        cy.apiCreateCustomField(randomFieldName, true, false).then((response) => {
        customFieldId = response.body.data.id;
        cy.apiSignup(firstName, lastName, email, password);
        cy.login(email, password);
        navigateToLandingPage();
      });
    });

    it('can skip the 2nd sign-up step and get redirected to the landing page', () => {
      cy.visit('/complete-signup').wait(1000);
      cy.get('#e2e-signup-step2');
      cy.get('.e2e-signup-step2-skip-btn').click();
      cy.location('pathname').should('eq', '/en-GB/');
      cy.get('#e2e-landing-page');
    });

    after(() => {
      cy.apiRemoveCustomField(customFieldId);
    });
  });

  describe('Required custom field', () => {
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let customFieldId: string;

    before(() => {
      cy.apiCreateCustomField(randomFieldName, true, true).then((response) => {
        customFieldId = response.body.data.id;
        cy.apiSignup(firstName, lastName, email, password);
        cy.login(email, password);
        navigateToLandingPage();
      });
    });

    it('shows an error message when submitting an empty form', () => {
      cy.visit('/complete-signup').wait(1000);
      cy.get('#e2e-signup-step2');
      cy.get('.e2e-signup-step2-button').click();
      cy.get('.e2e-error-message').should('contain', 'This field is required');
    });

    after(() => {
      cy.apiRemoveCustomField(customFieldId);
    });
  });

  describe('Required custom field', () => {
    const randomFieldName = randomString();
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let customFieldId: string;

    before(() => {
      cy.apiCreateCustomField(randomFieldName, true, true).then((response) => {
        customFieldId = response.body.data.id;
        cy.apiSignup(firstName, lastName, email, password);
        cy.login(email, password);
        navigateToLandingPage();
      });
    });

    it('successfully completes the sign-up process', () => {
      cy.visit('/complete-signup').wait(1000);
      cy.get('#e2e-signup-step2');
      cy.get(`#root_${randomFieldName}`).type('test');
      cy.get('.e2e-signup-step2-button').click();
      cy.location('pathname').should('eq', '/en-GB/');
      cy.get('#e2e-landing-page');
    });

    after(() => {
      cy.apiRemoveCustomField(customFieldId);
    });
  });

});