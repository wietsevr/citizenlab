import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

import GetIdeaVotesCount, { GetIdeaVotesCountChildProps } from 'resources/GetIdeaVotesCount';

import Icon from 'components/UI/Icon';

import styled from 'styled-components';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { colors, fontSizes } from 'utils/styleUtils';
import Label from 'components/UI/Label';

const VoteIcon: any = styled(Icon)`
  height: 18px;
  width: 20px;
  fill: ${colors.clRed};
  position: absolute;
  top: 2px;
`;

const UpvoteIcon = styled(VoteIcon)`
  fill: ${colors.clGreen};
  position: absolute;
  top: -1px;
`;

const IconContainer = styled.div`
  position: relative;
  width: 20px;
  margin-right: 5px;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  margin-right: 30px;
  flex-wrap: wrap;
`;

const Block = styled.div`
  display: flex;
  flex-wrap: nowrap;
  & > div {
    display: flex;
    flex-wrap: nowrap;
    margin-right: 7px;
    :last-child {
      margin-right: 0;
    }
  }
`;

const Votes = styled.div`
  font-size: ${fontSizes.large};
  font-weight: 600;
  color: ${colors.clRed};
`;
const UpVotes = styled(Votes)`
  color: ${colors.clGreen};
`;

interface DataProps {
  votesCount: GetIdeaVotesCountChildProps;
}

interface InputProps {
  ideaId: string;
  className?: string;
}

interface Props extends InputProps, DataProps {}

const VotePreview = (props: Props) => {
  const { votesCount, className } = props;
  if (!isNilOrError(votesCount)) {
    return (
      <Container className={className}>
        <Label value={<FormattedMessage {...messages.voteCounts} />}/>
        <Block>
          <div>
            <IconContainer>
              <UpvoteIcon name="upvote-2"/>
            </IconContainer>
            <UpVotes>
              {votesCount.up}
            </UpVotes>
          </div>
          <div>
            <IconContainer>
              <VoteIcon name="downvote-2"/>
            </IconContainer>
            <Votes>
              {votesCount.down}
            </Votes>
          </div>
        </Block>
      </Container>
    );
  }
  return null;
};

export default (inputProps: InputProps) => (
  <GetIdeaVotesCount ideaId={inputProps.ideaId}>
    {votesCount => <VotePreview {...inputProps} votesCount={votesCount} />}
  </GetIdeaVotesCount>
);