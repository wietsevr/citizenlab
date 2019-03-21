import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isEmpty } from 'lodash-es';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// services
import { dismissOnboardingCampaign, IOnboardingCampaignNames } from 'services/onboardingCampaigns';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetOnboardingCampaigns, { GetOnboardingCampaignsChildProps } from 'resources/GetOnboardingCampaigns';

// utils
import CSSTransition from 'react-transition-group/CSSTransition';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

// style
import styled, { withTheme } from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const contentTimeout = 350;
const contentEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentDelay = 550;

const Header = styled.div`
  width: 100%;
  height: 190px;
  position: relative;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMinTablet`
    height: 340px;
  `}
`;

const HeaderImageContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderImageContainerInner = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const HeaderImage = styled.img`
  width: 100%;
  height: auto;

  ${media.smallerThanMaxTablet`
    &.objectFitCoverSupported {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:not(.objectFitCoverSupported) {
      width: auto;
      height: 100%;
    }
  `}
`;

const HeaderImageOverlay = styled.div`
  background: ${({ theme }) => theme.signedInHeaderOverlayColor || theme.colorMain};
  opacity: ${({ theme }) => theme.signedInHeaderOverlayOpacity};
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const HeaderContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 75px;
  padding-right: 75px;
  overflow: hidden;

  &.content-enter {
    opacity: 0;

    &.content-enter-active {
      opacity: 1;
      transition: all ${contentTimeout}ms ${contentEasing} ${contentDelay}ms;
    }
  }

  &.content-enter-done {
    opacity: 1;
  }

  &.content-exit {
    opacity: 1;
    transition: all ${contentTimeout}ms ${contentEasing};

    &.content-exit-active {
      opacity: 0;
    }
  }

  &.content-exit-done {
    display: none;
  }

  p {
    color: #fff;
    font-size: ${fontSizes.xxl}px;
    line-height: 33px;
    font-weight: 400;
  }

  ${media.smallerThanMaxTablet`
    padding-left: 30px;
    padding-right: 30px;
  `}

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    padding-left: 20px;
    padding-right: 20px;
  `}
`;

const HeaderContentCompleteProfile = HeaderContent.extend``;
const HeaderContentCustomCta = HeaderContent.extend``;
const HeaderContentDefault = HeaderContent.extend`
  justify-content: center;

  p {
    text-align: center;
  }

  ${media.smallerThanMinTablet`
    align-items: center;
  `}
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  margin-right: 60px;

  ${media.smallerThanMinTablet`
    margin-right: 0;
  `}
`;

const Icons = styled.div`
  display: flex;
  margin-right: 30px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const NoAvatarUserIcon: any = styled(Icon)`
  fill: #fff;
  width: 50px;
  height: 50px;
`;

const CompleteProfileIcon = styled(Icon)`
  width: 50px;
  height: 50px;
`;

const Text = styled.div``;

const Right = styled.div`
  flex-shrink: 0;
  display: flex;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    margin-top: 30px;
  `}
`;

const SkipButton = styled(Button)`
  margin-right: 10px;

  ${media.smallerThanMinTablet`
    order: 2;
    margin-right: 0px;
  `}
`;

const AcceptButton = styled(Button)`
  ${media.smallerThanMinTablet`
    order: 1;
    margin-bottom: 10px;
  `}
`;

export interface InputProps {
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
  onboardingCampaigns: GetOnboardingCampaignsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State { }

class SignedInHeader extends PureComponent<Props, State> {
  goToSignUpPage = () => {
    trackEventByName(tracks.clickCreateAccountCTA, { extra: { location: 'signed-in header' } });
    clHistory.push('/sign-up');
  }

  handleSkipButtonClick = (name: IOnboardingCampaignNames) => () => {
    trackEventByName(tracks.clickSkipButton, { extra: { location: 'signed-in header', context: name } });
    dismissOnboardingCampaign(name);
  }

  render() {
    const { locale, tenant, authUser, className, onboardingCampaigns, theme } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(tenant) && !isNilOrError(authUser) && !isNilOrError(onboardingCampaigns)) {
      const tenantHeaderImage = (tenant.attributes.header_bg ? tenant.attributes.header_bg.large : null);
      const defaultMessage = tenant.attributes.settings.core.custom_onboarding_fallback_message;
      const objectFitCoverSupported = (window['CSS'] && CSS.supports('object-fit: cover'));

      return (
        <Header className={`e2e-signed-in-header ${className}`} id="hook-header">
          <HeaderImageContainer>
            <HeaderImageContainerInner>
              {tenantHeaderImage && <HeaderImage src={tenantHeaderImage} className={objectFitCoverSupported ? 'objectFitCoverSupported' : ''} />}
              <HeaderImageOverlay />
            </HeaderImageContainerInner>
          </HeaderImageContainer>

          {/* First header state - complete profile */}
          <CSSTransition
            classNames="content"
            in={onboardingCampaigns.name === 'complete_profile'}
            timeout={onboardingCampaigns.name === 'complete_profile' ? contentTimeout + contentDelay : contentTimeout}
            mountOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
          >
            <HeaderContentCompleteProfile id="e2e-singed-in-header-complete-profile">
              <Left>
                <Icons>
                  <NoAvatarUserIcon name="noAvatar" />
                  <CompleteProfileIcon name="completeProfile" />
                </Icons>
                <Text>
                  <FormattedMessage {...messages.completeYourProfile} tagName="p" values={{ firstName: authUser.attributes.first_name }} />
                </Text>
              </Left>

              <Right>
                <SkipButton
                  style="primary-outlined"
                  text={<FormattedMessage {...messages.doItLater} />}
                  onClick={this.handleSkipButtonClick(onboardingCampaigns.name)}
                  borderColor="#fff"
                  textColor="#fff"
                  className="e2e-singed-in-header-skip-btn"
                />
                <AcceptButton
                  text={<FormattedMessage {...messages.completeProfile} />}
                  linkTo="/profile/edit"
                  bgColor="#fff"
                  textColor={theme.colorMain}
                  className="e2e-singed-in-header-accept-btn"
                />
              </Right>
            </HeaderContentCompleteProfile>
          </CSSTransition>

          {/* Second header state - custom CTA */}
          <CSSTransition
            classNames="content"
            in={onboardingCampaigns.name === 'custom_cta'}
            timeout={onboardingCampaigns.name === 'custom_cta' ? contentTimeout + contentDelay : contentTimeout}
            mountOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
          >
            <HeaderContentCustomCta id="e2e-singed-in-header-custom-cta">
              <Left>
                <Text>
                  <T as="p" value={onboardingCampaigns.cta_message_multiloc} supportHtml />
                </Text>
              </Left>

              <Right>
                <SkipButton
                  style="primary-outlined"
                  text={<FormattedMessage {...messages.doItLater} />}
                  onClick={this.handleSkipButtonClick(onboardingCampaigns.name)}
                  borderColor="#fff"
                  textColor="#fff"
                />
                <AcceptButton
                  text={<T value={onboardingCampaigns.cta_button_multiloc} />}
                  linkTo={onboardingCampaigns.cta_button_link}
                  bgColor="#fff"
                  textColor={theme.colorMain}
                />
              </Right>
            </HeaderContentCustomCta>
          </CSSTransition>

          {/* Third header state - default customizable message */}
          <CSSTransition
            classNames="content"
            in={onboardingCampaigns.name === 'default'}
            timeout={onboardingCampaigns.name === 'default' ? contentTimeout + contentDelay : contentTimeout}
            mountOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
          >
            <HeaderContentDefault id="e2e-singed-in-header-default-cta">
              {defaultMessage && !isEmpty(defaultMessage)
                ? <T as="p" value={defaultMessage} supportHtml />
                : <FormattedMessage {...messages.defaultSignedInMessage} tagName="p" values={{ firstName: authUser.attributes.first_name }}/>
              }
            </HeaderContentDefault>
          </CSSTransition>
        </Header>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
  onboardingCampaigns: <GetOnboardingCampaigns />
});

const SignedInHeaderWithHoC = withTheme<Props, State>(SignedInHeader);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <SignedInHeaderWithHoC {...inputProps} {...dataProps} />}
  </Data>
);