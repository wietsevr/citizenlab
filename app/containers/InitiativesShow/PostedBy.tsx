import React, { memo } from 'react';

// components
import Icon from 'components/UI/Icon';
import UserName from 'components/UI/UserName';
import Link from 'utils/cl-router/Link';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const InitiativesIcon = styled(Icon)`
  width: 42px;
  height: 42px;
  background-color: rgba(4, 77, 108, 0.06);;
  fill: ${colors.adminTextColor};
  border-radius: 50%;
  padding: 10px;
  margin-right: 17px;
`;

const PostedByWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const PostedByText = styled.span`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  margin-bottom: 3px;
`;

const AboutInitiativesLink = styled(Link)`
  font-size: ${fontSizes.small}px;
  color: ${colors.clGreyOnGreyBackground};
  text-decoration: underline;

  &:hover {
    color: ${darken(0.2, colors.clGreyOnGreyBackground)};
    text-decoration: underline;
  }
`;

interface Props {
  authorId: string | null;
  className?: string;
  showAboutInitiatives: boolean;
}

const PostedBy = memo<Props>(({ authorId, className, showAboutInitiatives }) => {

  if (authorId) {
    const authorName = <UserName userId={authorId} emphasize linkToProfile hideLastName />;

    return (
      <Container id="e2e-initiative-posted-by" className={className || ''}>
        <InitiativesIcon name="initiatives"/>
        <PostedByWrapper>
          <PostedByText>
            <FormattedMessage {...messages.postedBy} values={{ authorName }} />
          </PostedByText>
          {showAboutInitiatives &&
            <AboutInitiativesLink
              to="/pages/initiatives"
            >
              <FormattedMessage {...messages.learnMore} />
            </AboutInitiativesLink>
          }
        </PostedByWrapper>
      </Container>
    );
  }

  return null;

});

export default PostedBy;