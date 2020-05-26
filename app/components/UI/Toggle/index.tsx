import React from 'react';
import styled, { css } from 'styled-components';
import { colors, fontSizes, boxShadowOutline } from 'utils/styleUtils';
import { hideVisually, darken } from 'polished';

const size = 21;
const padding = 3;

const Container = styled.div`
  display: inline-block;

  &.hasLabel {
    display: flex;
    align-items: center;
  }
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  ${hideVisually()};
`;

const StyledToggle = styled.i<{ checked: boolean, disabled: boolean }>`
  display: inline-block;
  padding: ${padding}px;
  padding-right: ${size}px;
  border-radius: ${size + padding}px;
  background-color: #ccc;
  border: solid 1px transparent;
  transition: padding 150ms cubic-bezier(0.165, 0.84, 0.44, 1),
  background-color 80ms ease-out;

  &:before {
    display: block;
    content: '';
    width: ${size}px;
    height: ${size}px;
    border-radius: ${size}px;
    background: #fff;
    transition: all 80ms ease-out;
  }

  &.enabled:hover {
    background: ${props => props.checked ? darken(0.05, colors.clGreen) : '#bbb'};
  }

  ${props => props.checked && css`
    padding-right: ${padding}px;
    padding-left: ${size}px;
    background-color: ${colors.clGreen};
  `};
`;

const StyledToggleWrapper = styled.div<{ checked: boolean, disabled: boolean }>`
  height: ${size + padding * 2}px;
  display: flex;
  align-items: center;
  cursor: pointer;

  ${props => props.disabled && css`
    opacity: 0.25;
    cursor: not-allowed;
  `};

  ${HiddenCheckbox}.focus-visible + & ${StyledToggle} {
    ${boxShadowOutline};
  }
`;

const Label = styled.div<{ labelTextColor?: string }>`
  color: ${({ labelTextColor }) => labelTextColor || colors.text};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  padding-left: 10px;
  cursor: pointer;
`;

export type Props = {
  checked: boolean;
  disabled?: boolean | undefined;
  label?: string | JSX.Element | null | undefined;
  labelTextColor?: string;
  size?: 'small' | 'normal' | 'large';
  onChange: (event: React.FormEvent) => void;
  className?: string;
  id?: string;
};

type State = {};

export default class Toggle extends React.PureComponent<Props, State> {
  handleOnClick = (event: React.FormEvent) => {
    if (!this.props.disabled) {
      event.preventDefault();
      this.props.onChange(event);
    }
  }

  render() {
    const { checked, disabled, label, labelTextColor, className, id, onChange } = this.props;

    return (
      <Container
        id={id}
        className={`${className || ''} ${label ? 'hasLabel' : ''}`}
      >
        <HiddenCheckbox
          onChange={onChange}
          checked={checked}
          disabled={disabled}
          tabIndex={0}
        />

        <StyledToggleWrapper
          checked={checked}
          disabled={!!disabled}
          onClick={this.handleOnClick}
        >
          <StyledToggle
            checked={checked}
            disabled={!!disabled}
            className={disabled ? 'disabled' : 'enabled'}
          />
        </StyledToggleWrapper>

        {label &&
          <Label
            onClick={this.handleOnClick}
            labelTextColor={labelTextColor}
          >
            {label}
          </Label>
        }
      </Container>
    );
  }
}
