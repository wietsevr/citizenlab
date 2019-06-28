import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';

import { isNilOrError } from 'utils/helperUtils';

// import Select from 'components/UI/Select';
import { Dropdown } from 'semantic-ui-react';

import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';
import { memoize } from 'lodash-es';

interface DataProps {
  prospectAssignees: GetUsersChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps {
  handleAssigneeFilterChange: (value: string) => void;
  projectId?: string | null;
  assignee?: string | null;
}

interface Props extends InputProps, DataProps {}

interface State {}

export class AssigneeFilter extends PureComponent<Props & InjectedIntlProps, State> {
 componentDidMount() {
   const { authUser, handleAssigneeFilterChange } = this.props;
   !isNilOrError(authUser) && handleAssigneeFilterChange(authUser.id);
 }

  getAssigneeOptions = memoize(
    (prospectAssignees, authUser) => {
      const { intl: { formatMessage } } = this.props;
      let assigneeOptions;

      if (isNilOrError(prospectAssignees.usersList) || isNilOrError(authUser)) {
        assigneeOptions = [];
      } else {
        assigneeOptions = prospectAssignees.usersList.filter(assignee => assignee.id !== authUser.id)
          .map(assignee => ({
            value: assignee.id,
            text: formatMessage(messages.assignedTo, {
              assigneeName:  `${assignee.attributes.first_name} ${assignee.attributes.last_name}`
            }),
            className: 'e2e-assignee-filter-other-user'
          }));

        // Order of assignee filter options:
        // All ideas > Assigned to me > Unassigned > Assigned to X (other admins/mods)
        assigneeOptions.unshift({ value: 'unassigned', text: formatMessage(messages.unassignedIdeas), id: 'e2e-assignee-filter-unassigned' });
        assigneeOptions.unshift({ value: authUser.id, text: formatMessage(messages.assignedToMe), id: 'e2e-assignee-filter-assigned-to-user' });
        assigneeOptions.unshift({ value: 'all', text: formatMessage(messages.anyAssignment), id: 'e2e-assignee-filter-all-ideas' });
      }
      return assigneeOptions;
    }
  );

  onAssigneeChange = (_event, assigneeOption) => {
    const realFiterParam = assigneeOption.value === 'all' ? undefined : assigneeOption.value;
    trackEventByName(tracks.assigneeFilterUsed, {
      assignee: realFiterParam,
      adminAtWork: this.props.authUser && this.props.authUser.id
    });
    this.props.handleAssigneeFilterChange(realFiterParam);
  }

  render() {
    const { assignee, prospectAssignees, authUser } = this.props;

    return (
      <Dropdown
        id="e2e-idea-select-assignee-filter"
        options={this.getAssigneeOptions(prospectAssignees, authUser)}
        onChange={this.onAssigneeChange}
        value={assignee || 'all'}
        search
        selection
      />
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  prospectAssignees: ({ projectId, render }) => projectId
    ? <GetUsers canModerateProject={projectId} pageSize={250}>{render}</GetUsers>
    : <GetUsers canModerate pageSize={250}>{render}</GetUsers>,
  authUser: <GetAuthUser />
});

const AssigneeFilterWithHocs = injectIntl<Props>(AssigneeFilter);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssigneeFilterWithHocs {...inputProps} {...dataProps} />}
  </Data>
);