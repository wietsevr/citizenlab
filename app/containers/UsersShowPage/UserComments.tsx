import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import IdeaCommentGroup from './IdeaCommentGroup';

// resources
import GetCommentsForUser, { GetCommentsForUserChildProps } from 'resources/GetCommentsForUser';
import { ICommentData } from 'services/comments';

// style
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;

  max-width: 760px;
`;

interface InputProps {
  userId: string;
}

interface DataProps {
  comments: GetCommentsForUserChildProps;
}

interface Props extends InputProps, DataProps {}

export const reducer = (acc: ICommentData[][], current: ICommentData) => {
  const accLen = acc.length;
  const lastArray = acc[accLen - 1];

  if (lastArray.length === 0) {
    return [[current]];
  }

  if (current.relationships.idea.data.id === lastArray[lastArray.length - 1].relationships.idea.data.id) {
    lastArray.push(current);
    return acc;
  } else {
    acc.push([current]);
    return acc;
  }
};

export const UsersComments = memo<Props>(({ comments, userId }) => (
  !isNilOrError(comments) && comments.length > 0) ? (
    <Container>
      {comments.reduce(reducer, [[]]).map(commentForIdea => (
        <IdeaCommentGroup
          key={commentForIdea[0].relationships.idea.data.id}
          ideaId={commentForIdea[0].relationships.idea.data.id}
          commentsForIdea={commentForIdea}
          userId={userId}
        />
      ))}
    </Container>
  ) : null
);

const Data = adopt<DataProps, InputProps>({
  comments: ({ userId, render }) =>  <GetCommentsForUser userId={userId}>{render}</GetCommentsForUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UsersComments {...inputProps} {...dataProps} />}
  </Data>
);
