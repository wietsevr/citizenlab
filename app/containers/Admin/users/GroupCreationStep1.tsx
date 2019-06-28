// Libraries
import React from 'react';

// Components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

const TypesWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
`;

const GroupType = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 85px 20px;
  align-items: center;
  text-align: center;

  &.manual {
    background: ${colors.lightGreyishBlue};
  }
  &.rules {
    background: ${colors.background};
  }
`;

const GroupIcon = styled(Icon)`
  width: 4.5rem;
  height: 4.5rem;
  margin-bottom: 1rem;

  .cl-icon-primary {
    fill: ${colors.adminTextColor};
  }

  .cl-icon-background {
    fill: ${rgba(colors.adminTextColor, .1)};
  }
`;

const GroupName = styled.p`
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
`;

const GroupDescription = styled.p`
  align-self: stretch;
`;

const MoreInfoLink = styled.a`
`;

const Step2Button = styled(Button)`
  margin-top: 60px;
`;

// Typings
import { IGroupData } from 'services/groups';

export interface Props {
  onOpenStep2: (groupType: IGroupData['attributes']['membership_type']) => void;
}
export interface State {}

export class GroupCreationStep1 extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  createStep2Handler = (groupType: IGroupData['attributes']['membership_type']) => () => {
    this.props.onOpenStep2(groupType);
  }

  render() {
    const formattedLink = this.props.intl.formatMessage(messages.readMoreLink);
    return (
      <TypesWrapper>
        <GroupType className="manual">
          <GroupIcon name="database" />
          <GroupName>
            <FormattedMessage {...messages.step1TypeNameNormal} />
          </GroupName>
          <GroupDescription>
            <FormattedMessage {...messages.step1TypeDescriptionNormal} />
          </GroupDescription>
          <MoreInfoLink href={formattedLink} target="_blank" ><FormattedMessage {...messages.step1ReadMore} /></MoreInfoLink>
          <Step2Button className="e2e-create-normal-group-button" style="cl-blue" onClick={this.createStep2Handler('manual')} circularCorners={false}>
            <FormattedMessage {...messages.step1CreateButtonNormal} />
          </Step2Button>
        </GroupType>
        <GroupType className="rules">
          <GroupIcon name="lightingBolt" />
          <GroupName>
            <FormattedMessage {...messages.step1TypeNameSmart} />
          </GroupName>
          <GroupDescription>
            <FormattedMessage {...messages.step1TypeDescriptionSmart} />
          </GroupDescription>
          <MoreInfoLink href={formattedLink} target="_blank" ><FormattedMessage {...messages.step1ReadMore} /></MoreInfoLink>
          <Step2Button className="e2e-create-rules-group-button" style="cl-blue" onClick={this.createStep2Handler('rules')} circularCorners={false}>
            <FormattedMessage {...messages.step1CreateButtonSmart} />
          </Step2Button>
        </GroupType>
      </TypesWrapper>
    );
  }
}

export default injectIntl<Props>(GroupCreationStep1);