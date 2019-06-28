// Libraries
import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { Formik } from 'formik';
import { isString, isEmpty } from 'lodash-es';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

// Components
import UsersHeader from './UsersHeader';
import Modal from 'components/UI/Modal';
import NormalGroupForm, { NormalFormValues } from './NormalGroupForm';
import RulesGroupForm, { RulesFormValues } from './RulesGroupForm';
import UserManager from './UserManager';

// Events
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Resources
import GetGroup, { GetGroupChildProps } from 'resources/GetGroup';

// Services
import { deleteGroup, updateGroup, MembershipType } from 'services/groups';
import { deleteMembershipByUserId } from 'services/groupMemberships';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// Typings
import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';
interface InputProps { }

interface DataProps {
  group: GetGroupChildProps;
}

interface Props extends InputProps, DataProps { }

export interface State {
  groupEditionModal: false | MembershipType;
  search: string | undefined;
}

interface Tracks {
  trackEditGroup: Function;
}

export class UsersGroup extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  constructor(props: Props & InjectedIntlProps & Tracks) {
    super(props);
    this.state = {
      groupEditionModal: false,
      search: undefined,
    };
  }

  closeGroupEditionModal = () => {
    this.setState({ groupEditionModal: false });
  }

  renderForm = (type: 'normal' | 'rules') => (props) => {
    if (type === 'normal') return <NormalGroupForm {...props} />;
    if (type === 'rules') return <RulesGroupForm {...props} />;
    return null;
  }

  openGroupEditionModal = () => {
    const { group, trackEditGroup } = this.props;

    if (!isNilOrError(group)) {
      const groupType =  group.attributes.membership_type;
      trackEditGroup({
        extra: {
          groupType,
        }
      });
      this.setState({ groupEditionModal: groupType });
    }
  }

  handleSubmitForm = (groupId: string) => (values: NormalFormValues | RulesFormValues, { setErrors, setSubmitting, setStatus }) => {
    updateGroup(groupId, { ...values }).then(() => {
      streams.fetchAllWith({
        dataId: [groupId],
        apiEndpoint: [`${API_PATH}/users`, `${API_PATH}/groups`],
        onlyFetchActiveStreams: true
      });
      this.closeGroupEditionModal();
    }).catch((errorResponse) => {
      if (isCLErrorJSON(errorResponse)) {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    });
  }

  deleteGroup = (groupId: string) => () => {
    const deleteMessage = this.props.intl.formatMessage(messages.groupDeletionConfirmation);

    if (window.confirm(deleteMessage)) {
      deleteGroup(groupId);
    }
  }

  searchGroup = (searchTerm: string) => {
    this.setState({
      search: (isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '')
    });
  }

  deleteUsersFromGroup = async (userIds: string[]) => {
    if (!isNilOrError(this.props.group) && this.props.group.attributes.membership_type === 'manual') {
      const deleteMessage = this.props.intl.formatMessage(messages.membershipDeleteConfirmation);

      if (window.confirm(deleteMessage)) {
        const groupId = this.props.group.id;
        const promises: Promise<any>[] = [];

        userIds.forEach(userId => promises.push(deleteMembershipByUserId(groupId, userId)));

        try {
          await Promise.all(promises);
          await streams.fetchAllWith({
            dataId: [groupId],
            apiEndpoint: [`${API_PATH}/groups`]
          });
        } catch (error) {
          eventEmitter.emit<JSX.Element>('usersAdmin', events.membershipDeleteFailed, <FormattedMessage {...messages.membershipDeleteFailed} />);
        }
      }
    }
  }

  render() {
    const { group } = this.props;
    const { groupEditionModal, search } = this.state;
    let ModalHeader;

    switch (groupEditionModal) {
      case 'manual':
        ModalHeader = <FormattedMessage {...messages.modalHeaderManual} />;
        break;
      case 'rules':
        ModalHeader = <FormattedMessage {...messages.modalHeaderRules} />;
        break;
    }

    if (!isNilOrError(group)) {
      return (
        <>
          <UsersHeader
            title={group.attributes.title_multiloc}
            smartGroup={group.attributes.membership_type === 'rules'}
            onEdit={this.openGroupEditionModal}
            onDelete={this.deleteGroup(group.id)}
            onSearch={this.searchGroup}
          />

          <UserManager
            search={search}
            groupId={group.id}
            groupType={group.attributes.membership_type}
            deleteUsersFromGroup={this.deleteUsersFromGroup}
          />

          <Modal
            header={ModalHeader}
            fixedHeight={true}
            opened={groupEditionModal !== false}
            close={this.closeGroupEditionModal}
          >
            <>
              {groupEditionModal === 'manual' &&
                <Formik
                  initialValues={group.attributes}
                  validate={NormalGroupForm.validate}
                  render={this.renderForm('normal')}
                  onSubmit={this.handleSubmitForm(group.id)}
                />
              }

              {groupEditionModal === 'rules' &&
                <Formik
                  initialValues={group.attributes}
                  validate={RulesGroupForm.validate}
                  render={this.renderForm('rules')}
                  onSubmit={this.handleSubmitForm(group.id)}
                />
              }
            </>
          </Modal>
        </>
      );
    }

    return null;
  }
}

const UsersGroupWithHoCs = injectTracks<Props>({
  trackEditGroup: tracks.editGroup,
})(injectIntl<Props>(UsersGroup));

export default withRouter((inputProps: WithRouterProps) => (
  <GetGroup id={inputProps.params.groupId}>
    {group => <UsersGroupWithHoCs {...inputProps} group={group} />}
  </GetGroup>
));