import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { browserHistory } from 'react-router';

// components
import Authorize from 'utils/containers/authorize';
import ClickOutside from 'utils/containers/clickOutside';
import Icon from 'components/UI/Icon';

// services
import { authUserStream, signOut } from 'services/auth';
import { IUser } from 'services/users';

// style
import styled from 'styled-components';
import { darken } from 'polished';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from '../../messages';

// images
const adminIcon = require('./adminIcon.svg');
const editProfileIcon = require('./editProfileIcon.svg');
const signOutIcon = require('./signOutIcon.svg');

const Container = styled(ClickOutside)`
  display: flex;
  margin-left: 0px;
  position: relative;
  cursor: pointer;
  outline: none;
`;

const UserIcon = styled(Icon)`
  height: 24px;
  fill: #84939E;
  transition: all 150ms ease;

  &:hover {
    fill: ${(props) => darken(0.15, '#84939E')};
  }
`;

const Dropdown = styled.div`
  min-width: 210px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50px;
  right: -5px;
  z-index: 1;
  padding: 8px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-sizing: border-box;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const DropdownItem = styled.div`
  color: #888;
  font-size: 18px;
  font-family: Proxima Nova;
  font-weight: 400;
  padding: 12px 15px 12px 25px;
  background: #fff;

  &:hover {
    background: #f9f9f9;
    color: #393939;
  }

  display: flex;
  justify-content: space-between;
`;

const MenuIcon = styled.img`
  width: 20px;
`;

type Props = {};

type State = {
  authUser: IUser | null;
  dropdownOpened: boolean;
};

export default class UserMenu extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      authUser: null,
      dropdownOpened: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe(authUser => this.setState({ authUser }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  toggleDropdown = () => {
    this.setState(state => ({ dropdownOpened: !state.dropdownOpened }));
  }

  closeDropdown = () => {
    this.setState({ dropdownOpened: false });
  }

  navigateTo = (path) => () => {
    browserHistory.push(path);
  }

  signOut = () => {
    signOut();
  }

  render() {
    const { authUser, dropdownOpened } = this.state;

    return (authUser ? (
      <Container id="e2e-user-menu-container" onClick={this.toggleDropdown} onClickOutside={this.closeDropdown}>
        {/* <UserImage avatar={true} src={authUser.data.attributes.avatar.small} /> */}
        <UserIcon name="user" />
        {dropdownOpened &&
          <Dropdown id="e2e-user-menu-dropdown">
            <Authorize action={['users', 'admin']} >
              <DropdownItem id="admin-link" onClick={this.navigateTo('/admin')}>
                <FormattedMessage {...messages.admin} />
                <MenuIcon src={adminIcon} alt="admin" />
              </DropdownItem>
            </Authorize>
            <DropdownItem id="e2e-profile-edit-link" onClick={this.navigateTo('/profile/edit')}>
              <FormattedMessage {...messages.editProfile} />
              <MenuIcon src={editProfileIcon} alt="edit profile" />
            </DropdownItem>
            <DropdownItem id="e2e-sign-out-link" onClick={this.signOut}>
              <FormattedMessage {...messages.signOut} />
              <MenuIcon src={signOutIcon} alt="sign out" />
            </DropdownItem>
          </Dropdown>
        }
      </Container>
    ) : null);
  }
}
