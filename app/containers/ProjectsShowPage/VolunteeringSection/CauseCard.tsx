import React, { memo, useCallback } from 'react';

// services
import { addVolunteer, deleteVolunteer } from 'services/volunteers';
import { ICauseData } from 'services/causes';

// resource hooks
import useAuthUser from 'hooks/useAuthUser';
import useWindowSize from 'hooks/useWindowSize';

// components
import LazyImage from 'components/LazyImage';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Warning from 'components/UI/Warning';
import Link from 'utils/cl-router/Link';

// utils
import { isEmptyMultiloc } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// styling
import styled from 'styled-components';
import { fontSizes, colors, media, viewportWidths } from 'utils/styleUtils';

const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
  display: flex;
  align-items: stretch;

  ${media.smallerThanMinTablet`
    flex-direction: column;
  `}
`;

const Left = styled.div`
  flex: 0 0 300px;
  width: 300px;
  overflow: hidden;

  ${media.smallerThanMinTablet`
    flex: auto;
    width: auto;
    margin-bottom: 20px;
  `}
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 40px;

  ${media.smallerThanMinTablet`
    margin-left: 0px;
  `}
`;

const Content = styled.div`
  flex: 1 1 auto;
  margin-bottom: 30px;
`;

const Title = styled.h3`
  color: ${colors.text};
  font-size: ${fontSizes.xxl}px;
  line-height: normal;
  margin: 0;
  margin-bottom: 20px;
  padding: 0;
`;

const Description = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
`;

const ImageWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  overflow: hidden;

  &.fillBackground {
    height: 225px;
    background: ${colors.placeholderBg};
  }
`;

const PlaceholderIcon = styled(Icon)`
  flex: 0 0 56px;
  width: 56px;
  height: 56px;
  fill: #fff;
`;

const StyledLazyImage = styled(LazyImage)`
  width: 100%;
`;

const VolunteersCount = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 5px;
  padding-right: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: rgba(0, 0, 0, 0.75);
`;

const VolunteersCountIcon = styled(Icon)`
  flex: 0 0 16px;
  width: 16px;
  height: 16px;
  fill: #fff;
  margin-right: 8px;
`;

const VolunteersCountText = styled.span`
  color: #fff;
  font-size: ${fontSizes.small}px;
  font-weight: 300;
`;

const ActionWrapper = styled.div`
  display: flex;
`;

interface Props {
  cause: ICauseData;
  className?: string;
}

const CauseCard = memo<Props>(({ cause, className }) => {

  const authUser = useAuthUser();
  const windowSize = useWindowSize();

  const isVolunteer = !!cause.relationships?.user_volunteer?.data;
  const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;
  const signUpLink = <Link to="/sign-up"><FormattedMessage {...messages.signUpLinkText} /></Link>;
  const signInLink = <Link to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></Link>;

  const handleOnVolunteerButtonClick = useCallback(() => {
    if (cause.relationships?.user_volunteer?.data) {
      deleteVolunteer(cause.id, cause.relationships.user_volunteer.data.id);
    } else {
      addVolunteer(cause.id);
    }
  }, [cause]);

  return (
    <Container className={className}>
      <Left>
        {cause.attributes.image.medium ? (
          <ImageWrapper>
            <StyledLazyImage src={cause.attributes.image.medium} alt="" />
            <VolunteersCount>
              <VolunteersCountIcon name="volunteer-hand" />
              <VolunteersCountText>
                <FormattedMessage {...messages.xVolunteers} values={{ x: cause.attributes.volunteers_count }}/>
              </VolunteersCountText>
            </VolunteersCount>
          </ImageWrapper>
        ) : (
          <ImageWrapper className="fillBackground">
            <PlaceholderIcon name="volunteer-hand" />
            <VolunteersCount>
              <VolunteersCountIcon name="volunteer-hand" />
              <VolunteersCountText>
                <FormattedMessage {...messages.xVolunteers} values={{ x: cause.attributes.volunteers_count }}/>
              </VolunteersCountText>
            </VolunteersCount>
          </ImageWrapper>
        )}
      </Left>

      <Right>
        <Content>
          <Title>
            <T value={cause.attributes.title_multiloc} />
          </Title>

          {!isEmptyMultiloc(cause.attributes.description_multiloc) &&
            <Description>
              <QuillEditedContent>
                <T value={cause.attributes.description_multiloc} supportHtml />
              </QuillEditedContent>
            </Description>
          }
        </Content>

        <ActionWrapper>
          {!authUser ? (
            <Warning>
              <FormattedMessage {...messages.notLoggedIn} values={{ signUpLink, signInLink }} />
            </Warning>
          ) : (
            <Button
              onClick={handleOnVolunteerButtonClick}
              icon={!isVolunteer ? 'volunteer-hand' : 'unvolunteer-hand'}
              disabled={!authUser}
              buttonStyle={!isVolunteer ? 'primary' : 'secondary'}
              fullWidth={smallerThanSmallTablet}
            >
              {isVolunteer
                ? <FormattedMessage {...messages.withdrawVolunteerButton} />
                : <FormattedMessage {...messages.becomeVolunteerButton} />}
            </Button>
          )}
        </ActionWrapper>
      </Right>
    </Container>
  );
});

export default CauseCard;