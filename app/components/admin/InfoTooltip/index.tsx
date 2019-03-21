import React from 'react';
import { omit } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';
import Tooltip from 'components/admin/Tooltip';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
// tslint:disable-next-line:no-vanilla-formatted-messages
import { FormattedMessage as OriginalFormattedMessage } from 'react-intl';
import { Omit } from 'typings';
import { IPosition } from 'components/admin/Popover';

interface Props extends Omit<OriginalFormattedMessage.Props, 'children'> {
  size?: 'small' | 'big';
  className?: string;
  children?: JSX.Element | null;
  offset?: number;
  openDelay?: number;
  position?: IPosition;
}

const StyledIcon = styled(Icon)`
  height: 16px;
  width: 16px;
  cursor: pointer;
  fill: ${colors.label};

  &:hover {
    fill: #000;
  }
`;

const TooltipWrapper: any = styled.div`
  padding: 15px;
  min-width: ${(props: any) => props.pxSize}px;
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: 18px;
  text-align: left;
`;

const getPxSize = (size: undefined | 'big' | 'small' | 'xs') => {
  if (size === 'big') {
    return 500;
  } else if (size === 'small') {
    return 300;
  } else if (size === 'xs') {
    return 200;
  } else {
    return 400;
  }
};

const InfoTooltip = (props: Props) => {
  const { position, size, className, children, offset, openDelay } = props;
  const pxSize = getPxSize(size);
  const passthroughProps = omit(props, ['size', 'position', 'className', 'children', 'offset', 'openDelay']);

  return (
    <Tooltip
      enabled
      content={(
        <TooltipWrapper pxSize={pxSize}>
          <FormattedMessage {...passthroughProps} />
        </TooltipWrapper>
      )}
      offset={offset || 20}
      position={position}
      className={className}
      openDelay={openDelay}
    >
      {children
        ? children
        : <StyledIcon name="info3" />
      }
    </Tooltip >
  );
};

export default InfoTooltip;