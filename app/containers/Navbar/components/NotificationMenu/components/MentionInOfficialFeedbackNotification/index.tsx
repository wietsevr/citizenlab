import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// services
import { IMentionInOfficialFeedbackNotificationData } from 'services/notifications';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';
import T from 'components/T';

interface InputProps {
  notification: IMentionInOfficialFeedbackNotificationData;
}
interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

const MentionInCommentNotification = memo<Props>(props => {
  const { notification, idea } = props;

  if (isNilOrError(idea)) return null;

  const { slug } = idea.attributes;

  const officialFeedbackAuthorMultiloc = notification.attributes.official_feedback_author;
  const deletedUser = isNilOrError(notification.attributes.initiating_user_slug);

  return (
    <NotificationWrapper
      linkTo={`/ideas/${slug}`}
      timing={notification.attributes.created_at}
      icon="notification_mention"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.mentionInOfficialFeedback}
        values={{
          officialName: deletedUser ?
            <DeletedUser>
              <FormattedMessage {...messages.deletedUser} />
            </DeletedUser>
            :
            <Link
              to={`/profile/${notification.attributes.initiating_user_slug}`}
              onClick={stopPropagation}
            >
              <T value={officialFeedbackAuthorMultiloc} />
            </Link>,
        }}
      />
    </NotificationWrapper>
  );
});

export default (inputProps: InputProps) => {
  const { notification } = inputProps;

  if (!notification.relationships.post.data) return null;

  return (
    <GetIdea id={notification.relationships.post.data.id}>
      {idea => <MentionInCommentNotification notification={notification} idea={idea} />}
    </GetIdea>
  );
};
