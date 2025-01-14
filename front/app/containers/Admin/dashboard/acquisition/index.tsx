// libraries
import React, { PureComponent } from 'react';
// import moment from 'moment';
import { ThemeProvider } from 'styled-components';

// components
import {
  chartTheme,
  GraphsContainer,
  GraphCard,
  GraphCardInner,
  GraphCardTitle,
} from '../';

// i18n
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from '../messages';

interface State {
  interval: 'weeks' | 'months' | 'years';
  intervalIndex: number;
}

type Props = {};

export default class AquisitionDashboard extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      interval: 'months',
      intervalIndex: 0,
    };
  }

  render() {
    return (
      <>
        <ThemeProvider theme={chartTheme}>
          <GraphsContainer>
            <GraphCard className="first halfWidth">
              <GraphCardInner>
                <GraphCardTitle>todo</GraphCardTitle>
              </GraphCardInner>
            </GraphCard>
            <GraphCard className="halfWidth">
              <GraphCardInner>
                <GraphCardTitle>todo</GraphCardTitle>
              </GraphCardInner>
            </GraphCard>
          </GraphsContainer>
        </ThemeProvider>
      </>
    );
  }
}
