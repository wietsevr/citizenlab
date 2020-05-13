import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import TextArea, { Props as TextAreaProps } from 'components/UI/TextArea';
import Label from 'components/UI/Label';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import IconTooltip from 'components/UI/IconTooltip';

// hooks
import useLocale from 'hooks/useLocale';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// typings
import { Locale, Multiloc } from 'typings';

const Container = styled.div``;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StyledLabel = styled(Label)`
  flex: 1;
  padding: 0;
  margin: 0;
`;

const Spacer = styled.div`
  flex: 1;
`;

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  width: auto;
`;

const LabelText = styled.span`
  color: ${colors.adminTextColor};
`;

export interface Props extends Omit<TextAreaProps, 'value' | 'onChange'> {
  valueMultiloc: Multiloc | null | undefined;
  onChange: (value: Multiloc, locale: Locale) => void;
  labelTextElement?: JSX.Element;
}

const TextAreaMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    valueMultiloc,
    onChange,
    className,
    label,
    labelTooltipText,
    labelTextElement,
    ...textAreaProps
  } = props;

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const locale = useLocale();

  useEffect(() => {
    !isNilOrError(locale) && setSelectedLocale(locale);
  }, [locale]);

  const handleValueOnChange = useCallback((value: string, locale: Locale) => {
    const newValueMultiloc = {
      ...(valueMultiloc || {}),
      [locale]: value
    } as Multiloc;

    onChange(newValueMultiloc, locale);
  }, [valueMultiloc, onChange]);

  const handleOnSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
    setSelectedLocale(newSelectedLocale);
  }, []);

  if (selectedLocale) {
    const id = `${props.id}-${selectedLocale}`;

    return (
      <Container className={className}>
        <LabelContainer>
          {(label || labelTextElement) ? (
            <StyledLabel htmlFor={id}>
              {labelTextElement || <LabelText>{label}</LabelText>}
              {labelTooltipText && <IconTooltip content={labelTooltipText} />}
            </StyledLabel>
          ) : <Spacer />}

          <StyledFormLocaleSwitcher
            onLocaleChange={handleOnSelectedLocaleChange}
            selectedLocale={selectedLocale}
            values={{ valueMultiloc }}
          />
        </LabelContainer>

        <TextArea
          {...textAreaProps}
          value={valueMultiloc?.[selectedLocale] || null}
          locale={selectedLocale}
          onChange={handleValueOnChange}
          id={id}
        />
      </Container>
    );
  }

  return null;
});

export default TextAreaMultilocWithLocaleSwitcher;