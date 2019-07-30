import React, { PureComponent } from 'react';
import { get, isUndefined } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// analytics
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import Sharing from 'components/Sharing';
import InitiativeMeta from './InitiativeMeta';
import Modal from 'components/UI/Modal';
import FileAttachments from 'components/UI/FileAttachments';
// import IdeaSharingModalContent from './IdeaSharingModalContent';
import FeatureFlag from 'components/FeatureFlag';
import Topics from 'components/PostComponents/Topics';
import Title from 'components/PostComponents/Title';
import LoadableDropdownMap from 'components/PostComponents/DropdownMap/LoadableDropdownMap';
import Body from 'components/PostComponents/Body';
import ContentFooter from 'components/PostComponents/ContentFooter';

import PostedBy from './PostedBy';
import Image from 'components/PostComponents/Image';
// import IdeaAuthor from './IdeaAuthor';
import Footer from 'components/PostComponents/Footer';
import Spinner from 'components/UI/Spinner';
import OfficialFeedback from 'components/PostComponents/OfficialFeedback';
import ActionBar from './ActionBar';
// import TranslateButton from 'components/UI/TranslateButton';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import GetOfficialFeedbacks, { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';
import GetPermission, { GetPermissionChildProps } from 'resources/GetPermission';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media, colors, postPageContentMaxWidth, viewportWidths } from 'utils/styleUtils';
import { columnsGapDesktop, rightColumnWidthDesktop, columnsGapTablet, rightColumnWidthTablet } from './styleConstants';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Loading = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px);
  background: #fff;
  opacity: 0;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}

  &.content-enter {
    opacity: 0;

    &.content-enter-active {
      opacity: 1;
      transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing} ${contentFadeInDelay}ms;
    }
  }

  &.content-enter-done {
    opacity: 1;
  }
`;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: ${postPageContentMaxWidth};
  display: flex;
  flex-direction: column;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  padding-top: 60px;
  padding-left: 60px;
  padding-right: 60px;
  position: relative;

  ${media.smallerThanMaxTablet`
    padding-top: 35px;
  `}

  ${media.smallerThanMinTablet`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Content = styled.div`
  width: 100%;
  display: flex;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const LeftColumn = styled.div`
  flex: 2;
  margin: 0;
  padding: 0;
  padding-right: ${columnsGapDesktop}px;

  ${media.tablet`
    padding-right: ${columnsGapTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const StyledTranslateButtonMobile = styled(TranslateButton)`
  display: none;
  width: fit-content;
  margin-bottom: 40px;

  ${media.smallerThanMinTablet`
    display: block;
  `}
`;

const InitiativeHeader = styled.div`
  margin-top: -5px;
  margin-bottom: 28px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
    margin-bottom: 45px;
  `}
`;

const IdeaImage = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid ${colors.separation};
`;

const StyledMobileIdeaPostedBy = styled(IdeaPostedBy)`
  margin-top: 4px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StyledIdeaAuthor = styled(IdeaAuthor)`
  margin-left: -4px;
  margin-bottom: 50px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledLoadableDropdownMap = styled(LoadableDropdownMap)`
  margin-bottom: 40px;

  ${media.smallerThanMaxTablet`
    margin-bottom: 20px;
  `}
`;

const RightColumn = styled.div`
  flex: 1;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = styled(RightColumn)`
  flex: 0 0 ${rightColumnWidthDesktop}px;
  width: ${rightColumnWidthDesktop}px;

  ${media.tablet`
    flex: 0 0 ${rightColumnWidthTablet}px;
    width: ${rightColumnWidthTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MetaContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SharingMobile = styled(Sharing)`
  padding: 0;
  margin: 0;
  margin-top: 40px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
`;

interface DataProps {
  initiative: GetInitiativeChildProps;
  locale: GetLocaleChildProps;
  ideaImages: GetIdeaImagesChildProps;
  initiativeFiles: GetResourceFilesChildProps;
  authUser: GetAuthUserChildProps;
  windowSize: GetWindowSizeChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
  postOfficialFeedbackPermission: GetPermissionChildProps;
}

interface InputProps {
  initiativeId: string | null;
  inModal?: boolean | undefined;
  className?: string;
}

interface Props extends DataProps, InputProps {}

interface State {
  loaded: boolean;
  spamModalVisible: boolean;
  ideaIdForSocialSharing: string | null;
  translateButtonClicked: boolean;
}

export class InitiativesShow extends PureComponent<Props & InjectedIntlProps & InjectedLocalized & WithRouterProps, State> {
  initialState: State;

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      spamModalVisible: false,
      ideaIdForSocialSharing: null,
      translateButtonClicked: false,
    };
  }

  componentDidMount() {
    const newIdeaId = get(this.props.location.query, 'new_idea_id');

    this.setLoaded();

    if (newIdeaId) {
      setTimeout(() => {
        this.setState({ ideaIdForSocialSharing: newIdeaId });
      }, 1500);

      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  componentDidUpdate() {
    this.setLoaded();
  }

  setLoaded = () => {
    const { loaded } = this.state;
    const { initiative, ideaImages, officialFeedbacks } = this.props;

    if (!loaded && !isNilOrError(initiative) && !isUndefined(ideaImages) && !isUndefined(officialFeedbacks.officialFeedbacksList)) {
      this.setState({ loaded: true });
    }
  }

  closeIdeaSocialSharingModal = () => {
    this.setState({ ideaIdForSocialSharing: null });
  }

  onTranslateInitiative = () => {
    this.setState(prevState => {
      // analytics
      if (prevState.translateButtonClicked === true) {
        trackEvent(tracks.clickGoBackToOriginalInitiativeCopyButton);
      } else if (prevState.translateButtonClicked === false) {
        trackEvent(tracks.clickTranslateInitiativeButton);
      }

      return ({
        translateButtonClicked: !prevState.translateButtonClicked
      });
    });
  }

  render() {
    const {
      initiativeFiles,
      locale,
      initiative,
      localize,
      ideaImages,
      authUser,
      windowSize,
      className,
      postOfficialFeedbackPermission
    } = this.props;
    const { loaded, ideaIdForSocialSharing, translateButtonClicked } = this.state;
    const { formatMessage } = this.props.intl;
    let content: JSX.Element | null = null;

    if (!isNilOrError(initiative) && !isNilOrError(locale) && loaded) {
      const authorId: string | null = get(initiative, 'relationships.author.data.id', null);
      const initiativeCreatedAt = initiative.attributes.created_at;
      const titleMultiloc = initiative.attributes.title_multiloc;
      const initiativeTitle = localize(titleMultiloc);
      const ideaImageLarge: string | null = get(ideaImages, '[0].attributes.versions.large', null);
      const initiativeGeoPosition = (initiative.attributes.location_point_geojson || null);
      const initiativeAddress = (initiative.attributes.location_description || null);
      const topicIds = (initiative.relationships.topics.data ? initiative.relationships.topics.data.map(item => item.id) : []);
      const initiativeUrl = location.href;
      const initiativeId = initiative.id;
      const initiativeBody = localize(initiative.attributes.body_multiloc);
      const biggerThanLargeTablet = windowSize ? windowSize > viewportWidths.largeTablet : false;
      const smallerThanLargeTablet = windowSize ? windowSize <= viewportWidths.largeTablet : false;
      const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;
      const utmParams = !isNilOrError(authUser) ? {
        source: 'share_idea',
        campaign: 'share_content',
        content: authUser.id
      } : {
        source: 'share_idea',
        campaign: 'share_content'
      };
      const showTranslateButton = (
        !isNilOrError(initiative) &&
        !isNilOrError(locale) &&
        !initiative.attributes.title_multiloc[locale]
      );

      content = (
        <>
          <InitiativeMeta initiativeId={initiativeId} />

          <ActionBar
            initiativeId={initiativeId}
            translateButtonClicked={translateButtonClicked}
            onTranslateInitiative={this.onTranslateInitiative}
          />

          <IdeaContainer>
            <FeatureFlag name="machine_translations">
              {showTranslateButton && smallerThanSmallTablet &&
                <StyledTranslateButtonMobile
                  translateButtonClicked={translateButtonClicked}
                  onClick={this.onTranslateInitiative}
                />
              }
            </FeatureFlag>

            <Content>
              <LeftColumn>
                <Topics topicIds={topicIds} />
                <InitiativeHeader>
                  <Title
                    id={initiativeId}
                    context="initiative"
                    title={initiativeTitle}
                    locale={locale}
                    translateButtonClicked={translateButtonClicked}
                  />

                  {smallerThanLargeTablet &&
                    <StyledMobileIdeaPostedBy authorId={authorId} />
                  }
                </InitiativeHeader>

                {biggerThanLargeTablet &&
                  <PostedBy
                    authorId={authorId}
                  />
                }

                {ideaImageLarge &&
                  <Image
                    src={ideaImageLarge}
                    postType="initiative"
                    className="e2e-initiativeImage"
                  />
                }

                {initiativeGeoPosition && initiativeAddress &&
                  <StyledLoadableDropdownMap
                    address={initiativeAddress}
                    position={initiativeGeoPosition}
                  />
                }

                <Body
                  id={initiativeId}
                  postType="initiative"
                  locale={locale}
                  body={initiativeBody}
                  translateButtonClicked={translateButtonClicked}
                />

                {!isNilOrError(initiativeFiles) && initiativeFiles.length > 0 &&
                  <FileAttachments files={initiativeFiles} />
                }

                <StyledOfficialFeedback
                  postId={initiativeId}
                  postType="initiative"
                  permissionToPost={postOfficialFeedbackPermission}
                />

                <ContentFooter
                  postType="initiative"
                  id={initiativeId}
                  createdAt={initiativeCreatedAt}
                  commentsCount={initiative.attributes.comments_count}
                />

                {smallerThanLargeTablet &&
                  <SharingMobile
                    context="initiative"
                    url={initiativeUrl}
                    twitterMessage={formatMessage(messages.twitterMessage, { initiativeTitle })}
                    emailSubject={formatMessage(messages.emailSharingSubject, { initiativeTitle })}
                    emailBody={formatMessage(messages.emailSharingBody, { initiativeUrl, initiativeTitle })}
                    utmParams={utmParams}
                  />
                }
              </LeftColumn>

              {biggerThanLargeTablet &&
                <RightColumnDesktop>
                  <MetaContent>
                  < SharingWrapper>
                      <Sharing
                        context="initiative"
                        url={initiativeUrl}
                        twitterMessage={formatMessage(messages.twitterMessage, { initiativeTitle })}
                        emailSubject={formatMessage(messages.emailSharingSubject, { initiativeTitle })}
                        emailBody={formatMessage(messages.emailSharingBody, { initiativeUrl, initiativeTitle })}
                        utmParams={utmParams}
                      />
                    </SharingWrapper>
                  </MetaContent>
                </RightColumnDesktop>
              }
            </Content>
          </IdeaContainer>

          {loaded && <Footer postId={initiativeId} postType="initiative" />}
        </>
      );
    }

    return (
      <>
        {!loaded &&
          <Loading>
            <Spinner />
          </Loading>
        }

        <CSSTransition
          classNames="content"
          in={loaded}
          timeout={{
            enter: contentFadeInDuration + contentFadeInDelay,
            exit: 0
          }}
          enter={true}
          exit={false}
        >
          <Container id="e2e-idea-show" className={className}>
            {content}
          </Container>
        </CSSTransition>

        <FeatureFlag name="ideaflow_social_sharing">
          <Modal
            opened={!!ideaIdForSocialSharing}
            close={this.closeIdeaSocialSharingModal}
            hasSkipButton={true}
            skipText={<FormattedMessage {...messages.skipSharing} />}
            label={formatMessage(messages.modalShareLabel)}
          >
            {ideaIdForSocialSharing &&
              <IdeaSharingModalContent ideaId={ideaIdForSocialSharing} />
            }
          </Modal>
        </FeatureFlag>
      </>
    );
  }
}

const InitiativesShowWithHOCs = injectLocalize<Props>(injectIntl(withRouter(InitiativesShow)));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser/>,
  windowSize: <GetWindowSize debounce={50} />,
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>,
  initiativeFiles: ({ initiativeId, render }) => <GetResourceFiles resourceId={initiativeId} resourceType="initiative">{render}</GetResourceFiles>,
  officialFeedbacks: ({ initiativeId, render }) => <GetOfficialFeedbacks postId={initiativeId} postType="initiative">{render}</GetOfficialFeedbacks>,
  postOfficialFeedbackPermission: ({ initiative, render }) => !isNilOrError(initiative) ? <GetPermission item={initiative} action="moderate" >{render}</GetPermission> : null,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
