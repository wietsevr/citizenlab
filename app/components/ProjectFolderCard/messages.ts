import { defineMessages } from 'react-intl';

export default defineMessages({
  a11y_projectTitle: {
    id: 'app.components.ProjectFolderCard.a11y_projectTitle',
    defaultMessage: 'Project title: ',
  },
  a11y_projectDescription: {
    id: 'app.components.ProjectFolderCard.a11y_projectDescription',
    defaultMessage: 'Project description: ',
  },
  numberOfProjects: {
    id: 'app.components.ProjectFolderCard.numberOfProjects',
    defaultMessage: '{numberOfProjects, plural, no {# projects} one {# project} other {# projects}}',
  }
});