import { randomString, randomEmail } from '../../support/commands';

beforeEach(() => {
  cy.login('admin@citizenlab.co', 'testtest');
});

describe('Assignee filter', () => {
  it('Filters on All ideas', () => {
    cy.visit('/admin/ideas/');

    // grab and open assignee filter menu
    cy.get('#e2e-idea-select-assignee-filter').click();
    // click on All ideas filter
    cy.get('#e2e-assignee-filter-all-ideas').click();
    // check that number of ideas on first page is 10
    cy.get('.e2e-idea-manager-idea-row').should('have.length', 10);
  });

  it('Filters on Assigned to me', () => {

    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = randomString();
      const userId = user.body.data.id;

      // create project with signed-in admin/user as default assignee
      cy.apiCreateProject('continuous', projectTitle, projectDescriptionPreview, projectDescription, 'published', userId).then((project) => {
        const projectId = project.body.data.id;
        const ideaTitle = randomString();
        const ideaContent = randomString();

        cy.apiCreateIdea(projectId, ideaTitle, ideaContent);

        // do a refresh for the new idea to appear
        cy.visit('/admin/ideas/');
        // grab and open assignee filter menu
        cy.get('#e2e-idea-select-assignee-filter').click();
        // click on Assigned to me filter
        cy.get('#e2e-assignee-filter-assigned-to-user').click();
        // Check whether the newly created idea is assigned to the user
        cy.get('.e2e-idea-manager-idea-row').contains(ideaTitle);
      });
    });
  });
});

describe('Need feedback toggle', () => {
  it('Filters on ideas that need feedback', () => {
    cy.visit('/admin/ideas/');

    cy.getAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = randomString();
      const userId = user.body.data.id;

      // create project with signed-in admin/user as default assignee
      cy.apiCreateProject('continuous', projectTitle, projectDescriptionPreview, projectDescription, 'published', userId).then((project) => {
        const projectId = project.body.data.id;
        const ideaTitle1 = randomString();
        const ideaTitle2 = randomString();
        const ideaContent1 = randomString();
        const ideaContent2 = randomString();

        // Create one idea with official feedback
        cy.apiCreateIdea(projectId, ideaTitle1, ideaContent1).then(idea => {
          const ideaId = idea.body.data.id;
          const officialFeedbackContent = randomString();
          const officialFeedbackAuthor = randomString();
          cy.apiCreateOfficialFeedback(ideaId, officialFeedbackContent, officialFeedbackAuthor);
        });
        // Create one idea without official feedback
        cy.apiCreateIdea(projectId, ideaTitle2, ideaContent2);

        // Select the newly create project as a filter and check if it just shows our two created ideas
        cy.get('.e2e-idea-manager-project-filter-item').first().click();
        cy.get('.e2e-idea-manager-idea-row').should('have.length', 2);

        // Turn the 'need feedback' toggle on and check whether it only shows the idea without official feedback
        cy.get('#e2e-feedback_needed_filter_toggle').click();
        cy.get('.e2e-idea-manager-idea-row').should('have.length', 1);

      });
    });
  });
});

describe('Idea preview ', () => {
  it('Opens when you click an idea title', () => {
    cy.visit('/admin/ideas/');
    // grab and open assignee filter menu
    cy.get('#e2e-idea-select-assignee-filter').click();
    // click on All ideas filter
    cy.get('#e2e-assignee-filter-all-ideas').click();
    // click on title of first idea
    cy.get('.e2e-idea-manager-idea-title').first().click().then(ideaTitle => {
    // check if the modal popped out and has the idea in it
    cy.get('#e2e-modal-container').find('.e2e-ideatitle').contains(ideaTitle.text());
    });
  });

  it('Closes when you click the X (close button)', () => {
    cy.visit('/admin/ideas/');
    // grab and open assignee filter menu
    cy.get('#e2e-idea-select-assignee-filter').click();
    // click on All ideas filter
    cy.get('#e2e-assignee-filter-all-ideas').click();
    // click on title of first idea to open modal
    cy.get('.e2e-idea-manager-idea-title').first().click();
    // close modal
    cy.get('.e2e-modal-close-button').click();
    // check if the modal is no longer on the page
    cy.get('#e2e-modal-container').should('have.length', 0);
  });
});

describe('Assignee select', () => {
  it('Assigns a user to an idea', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();

    cy.apiCreateAdmin(firstName, lastName, email, password).then(newAdmin => {
      const newAdminFirstName = newAdmin.body.data.attributes.first_name;
      const newAdminLastName = newAdmin.body.data.attributes.last_name;

      // Refresh page to make sure new admin is picked up
      cy.visit('/admin/ideas/');
      // Select unassigned in assignee filter
      cy.get('#e2e-idea-select-assignee-filter').click();
      cy.get('#e2e-assignee-filter-unassigned').click();
      // Pick first idea in idea table and assign it to our user
      cy.wait(500);
      cy.get('.e2e-idea-manager-idea-row').first()
        .find('.e2e-idea-manager-idea-row-assignee-select').click()
        .contains(`${newAdminFirstName} ${newAdminLastName}`).click();
      // Select this user in the assignee filter
      cy.get('#e2e-idea-select-assignee-filter').click()
        .find('.e2e-assignee-filter-other-user')
        .contains(`Assigned to ${newAdminFirstName} ${newAdminLastName}`).click();
      // Check if idea is there
      cy.get('.e2e-idea-manager-idea-row').should('have.length', 1);
    });

  });
});