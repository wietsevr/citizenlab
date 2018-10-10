import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// components
import Dropdown from 'components/UI/Dropdown';
import Icon from 'components/UI/Icon';

// services
import { updateLocale } from 'services/locale';
import { updateUser } from 'services/users';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import { shortenedAppLocalePairs } from 'containers/App/constants';

// typings
import { Locale } from 'typings';


const Container = styled.div`
  position: relative;
  cursor: pointer;

  * {
    user-select: none;
  }
`;

const DropdownItemIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  fill: ${colors.label};
  margin-top: 1px;
  margin-left: 4px;
  transition: all 80ms ease-out;
`;

const OpenMenuButton = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.medium}px;
  font-weight: 400;
  line-height: 17px;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  outline: none;

  &:hover,
  &:focus {
    color: #000;

    ${DropdownItemIcon} {
      fill: #000;
    }
  }
`;

const ListItemText = styled.div`
  color: ${colors.label};
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
`;

const ListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: #fff;
  border-radius: 5px;
  outline: none;
  cursor: pointer;
  transition: all 80ms ease-out;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.active {
    background: ${colors.clDropdownHoverBackground};

    ${ListItemText} {
      color: #000;
    }
  }
`;

interface DataProps {
  tenant: GetTenantChildProps;
  user: GetAuthUserChildProps;
}

interface Props extends DataProps {
  currentLocale: Locale;
  localeOptions: Locale[];
}

type State = {
  dropdownOpened: boolean;
};

class LanguageSelector extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      dropdownOpened: false
    };
  }

  toggleDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();
    this.setState(({ dropdownOpened }) => ({ dropdownOpened: !dropdownOpened }));
  }

  handleLanguageSelect = (newLocale: Locale) => () => {
    const userId = this.props.user && this.props.user.id;
    // const { id: userId } = this.props.user.;
    // const userId: string = !isNilOrError(user) && user.id;
    const update = { locale: newLocale };
    userId && updateUser(userId, update).then((user) => {
      updateLocale(user.data.attributes.locale);
    });
    this.setState({ dropdownOpened: false });
  }

  render() {
    const { dropdownOpened } = this.state;
    const { locales: localeOptions } = !isNilOrError(this.props.tenant) && this.props.tenant.data.attributes.settings.core;
    const { currentLocale } = this.props;

    return (
      <Container>
        <OpenMenuButton onClick={this.toggleDropdown}>
          {currentLocale.substr(0, 2).toUpperCase()}
          <DropdownItemIcon name="dropdown" />
        </OpenMenuButton>

        <Dropdown
          width="180px"
          top="36px"
          right="-5px"
          mobileRight="-5px"
          opened={dropdownOpened}
          onClickOutside={this.toggleDropdown}
          content={(
            <>
              {localeOptions.map((locale, index) => {
                const last = (index === localeOptions.length - 1);

                return (
                  <ListItem
                    key={locale}
                    onClick={this.handleLanguageSelect(locale)}
                    className={`${locale === currentLocale ? 'active' : ''} ${last ? 'last' : ''}`}
                  >
                    <ListItemText>{shortenedAppLocalePairs[locale]}</ListItemText>
                  </ListItem>
                );
              })}
            </>
          )}
        />
      </Container>
    );
  }
}

const Data = adopt<DataProps>({
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
});

export default () => (
  <Data>
    {dataProps => <LanguageSelector {...dataProps} />}
  </Data>
);
