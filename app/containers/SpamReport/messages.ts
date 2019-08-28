import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.SpamReport.title',
    defaultMessage: 'Why do you want to report this as spam?',
  },
  subtitle: {
    id: 'app.containers.SpamReport.subtitle',
    defaultMessage: 'Select the reason for your report',
  },
  wrong_content: {
    id: 'app.containers.SpamReport.wrong_content',
    defaultMessage: 'This content does not belong here',
  },
  inappropriate: {
    id: 'app.containers.SpamReport.inappropriate',
    defaultMessage: 'I find this content inappropriate or offensive',
  },
  other: {
    id: 'app.containers.SpamReport.other',
    defaultMessage: 'Other reason',
  },
  otherReasonPlaceholder: {
    id: 'app.containers.SpamReport.otherReasonPlaceholder',
    defaultMessage: 'Description',
  },
  buttonSave: {
    id: 'app.containers.SpamReport.buttonSave',
    defaultMessage: 'Report',
  },
  buttonError: {
    id: 'app.containers.SpamReport.buttonError',
    defaultMessage: 'Error',
  },
  buttonSuccess: {
    id: 'app.containers.SpamReport.buttonSuccess',
    defaultMessage: 'Success',
  },
  messageSuccess: {
    id: 'app.containers.SpamReport.messageSuccess',
    defaultMessage: 'Your report has been sent',
  },
  messageError: {
    id: 'app.containers.SpamReport.messageError',
    defaultMessage: 'There was an error sending your report, please try again.',
  },
});