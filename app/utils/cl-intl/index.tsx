import FormattedMessage from './FormattedMessage';
import injectIntl from './injectIntl';

// tslint:disable-next-line:no-vanilla-formatted-messages
import { Messages, FormattedMessage as OriginalFormattedMessage } from 'react-intl';

type IMessageInfo = {
  message: Messages['key'];
  values?: OriginalFormattedMessage.Props['values'];
};

export {
  FormattedMessage,
  injectIntl,
  IMessageInfo
};
