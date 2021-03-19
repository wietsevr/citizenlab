import { FC, useEffect } from 'react';
import { InjectedIntlProps } from 'react-intl';
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  onData: (data: InsertConfigurationOptions<ITab>) => void;
};

const Tab: FC<Props & InjectedIntlProps> = ({
  onData,
  intl: { formatMessage },
}) => {
  useEffect(() => {
    onData({
      configuration: {
        label: formatMessage(messages.projectEditTopicsTab),
        name: 'topics',
        url: 'topics',
        feature: 'custom_topics',
      },
      insertBeforeName: 'phases',
    });
  }, []);

  return null;
};

export default injectIntl(Tab);
