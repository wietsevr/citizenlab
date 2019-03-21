import React, { PureComponent } from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const Text = styled.span`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 26px;
  transition: all 100ms ease-out;
`;

const DropdownIcon = styled(Icon)`
  width: 11px;
  height: 7px;
  fill: ${({ theme }) => theme.colorText};
  margin-left: 4px;
  margin-top: 2px;
  transition: all 100ms ease-out;
`;

const Container = styled.button`
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  margin: 0;
  position: relative;

  &:hover,
  &:focus,
  &.opened {
    ${Text} {
      color: ${({ theme }) => darken(0.15, theme.colorText)};
    }

    ${DropdownIcon} {
      fill: ${({ theme }) => darken(0.15, theme.colorText)};
    }
  }

  &:focus {
    outline: none;
  }
`;

type Props = {
  title: string | JSX.Element,
  opened: boolean,
  onClick: Function,
  baseID: string,
};

type State = {};

export default class Title extends PureComponent<Props, State> {
  handleClick = (event) => {
    this.props.onClick(event);
  }

  render() {
    const className = this.props['className'];
    const { title, opened, baseID } = this.props;

    return (
      <Container
        onClick={this.handleClick}
        aria-expanded={opened}
        id={`${baseID}-label`}
        className={`e2e-filter-selector-button FilterSelectorTitle ${opened ? 'opened' : ''} ${className}`}
      >
        <Text className="FilterSelectorTitleText">{title}</Text>
        <DropdownIcon className="FilterSelectorTitleIcon" name="dropdown" />
      </Container>
    );
  }
}