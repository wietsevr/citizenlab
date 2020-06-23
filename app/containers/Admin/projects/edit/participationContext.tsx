import React, { PureComponent } from 'react';
import { Subscription, Observable, of } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isFinite, isEqual, omitBy, isNil } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Input from 'components/UI/Input';
import Error from 'components/UI/Error';
import Label from 'components/UI/Label';
import Radio from 'components/UI/Radio';
import { Toggle } from 'cl2-component-library';
import { Section, SectionField, SubSectionTitle } from 'components/admin/Section';
import IconTooltip from 'components/UI/IconTooltip';

// services
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, IPhase } from 'services/phases';
import { ParticipationMethod, SurveyServices } from 'services/participationContexts';
import eventEmitter from 'utils/eventEmitter';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import FeatureFlag from 'components/FeatureFlag';
import { fontSizes, colors } from 'utils/styleUtils';

// Typings
import { CLError } from 'typings';
import { adopt } from 'react-adopt';
import GetFeatureFlag from 'resources/GetFeatureFlag';

const Container = styled.div``;

const StyledSection = styled(Section)`
  margin-bottom: 0;
`;

const StyledSectionField = styled(SectionField)`
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const ToggleRow = styled(Row)`
  width: 100%;
  max-width: 288px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  &.last {
    margin-bottom: 0px;
  }
`;

const ToggleLabel = styled(Label)`
  flex: 1;
  color: #333;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-right: 15px;
`;

const VotingLimitInput = styled(Input)`
  width: 100px;
  height: 46px !important;
`;

const BudgetingAmountInput = styled(Input)`
  max-width: 288px;
`;

const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

const StyledRadio = styled(Radio)`
  margin-bottom: 25px;
`;

const LabelText = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -2px;

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .header {
    padding: 0;
    margin: 0;
    margin-bottom: 3px;
    font-weight: 600;
    font-size: ${fontSizes.base}px;
  }

  .description {
    color: ${colors.adminSecondaryTextColor};
  }
`;

export interface IParticipationContextConfig {
  participation_method: ParticipationMethod;
  posting_enabled?: boolean | null;
  commenting_enabled?: boolean | null;
  voting_enabled?: boolean | null;
  voting_method?: 'unlimited' | 'limited' | null;
  voting_limited_max?: number | null;
  downvoting_enabled?: boolean | null;
  presentation_mode?: 'map' | 'card' | null;
  max_budget?: number | null;
  survey_service?: SurveyServices | null;
  survey_embed_url?: string | null;
  poll_anonymous?: boolean;
}

interface DataProps {
  tenant: GetTenantChildProps;
  surveys_enabled: boolean | null;
  typeform_enabled: boolean | null;
  google_forms_enabled: boolean | null;
  survey_monkey_enabled: boolean | null;
}

interface InputProps {
  onChange: (arg: IParticipationContextConfig) => void;
  onSubmit: (arg: IParticipationContextConfig) => void;
  projectId?: string | undefined | null;
  phaseId?: string | undefined | null;
  apiErrors?: { [fieldName: string]: CLError[] } | null;
}

interface Props extends DataProps, InputProps { }

interface State extends IParticipationContextConfig {
  noVotingLimit: JSX.Element | null;
  noBudgetingAmount: JSX.Element | null;
  loaded: boolean;
}

class ParticipationContext extends PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[];

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      participation_method: 'ideation',
      posting_enabled: true,
      commenting_enabled: true,
      voting_enabled: true,
      voting_method: 'unlimited',
      voting_limited_max: 5,
      downvoting_enabled: true,
      presentation_mode: 'card',
      max_budget: null,
      survey_service: null,
      survey_embed_url: null,
      loaded: false,
      noVotingLimit: null,
      noBudgetingAmount: null,
      poll_anonymous: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { projectId, phaseId } = this.props;
    let data$: Observable<IProject | IPhase | null> = of(null);

    if (projectId) {
      data$ = projectByIdStream(projectId).observable;
    } else if (phaseId) {
      data$ = phaseStream(phaseId).observable;
    }

    this.subscriptions = [
      data$.subscribe((data) => {
        if (data) {
          const participation_method = data.data.attributes.participation_method as ParticipationMethod;
          const {
            posting_enabled,
            commenting_enabled,
            voting_enabled,
            voting_method,
            voting_limited_max,
            downvoting_enabled,
            presentation_mode,
            max_budget,
            survey_embed_url,
            survey_service,
            poll_anonymous,
          } = data.data.attributes;

          this.setState({
            participation_method,
            posting_enabled,
            commenting_enabled,
            voting_enabled,
            voting_method,
            voting_limited_max,
            downvoting_enabled,
            presentation_mode,
            max_budget,
            survey_embed_url,
            survey_service,
            poll_anonymous,
            loaded: true
          });
        } else {
          this.setState({ loaded: true });
        }
      }),

      eventEmitter
        .observeEvent('getParticipationContext')
        .pipe(filter(() => this.validate()))
        .subscribe(() => {
          const output = this.getOutput();
          this.props.onSubmit(output);
        })
    ];
  }

  getOutput = () => {
    const {
      participation_method,
      posting_enabled,
      commenting_enabled,
      voting_enabled,
      voting_method,
      voting_limited_max,
      downvoting_enabled,
      presentation_mode,
      max_budget,
      survey_embed_url,
      survey_service,
      poll_anonymous,
    } = this.state;
    let output: IParticipationContextConfig = {} as any;

    if (participation_method === 'information') {
      output = {
        participation_method
      };
    } else if (participation_method === 'ideation') {
      output = omitBy({
        participation_method,
        posting_enabled,
        commenting_enabled,
        voting_enabled,
        presentation_mode,
        voting_method: (voting_enabled ? voting_method : null),
        voting_limited_max: (voting_enabled && voting_method === 'limited' ? voting_limited_max : null),
        downvoting_enabled: (voting_enabled ? downvoting_enabled : null)
      }, isNil) as IParticipationContextConfig;
    } else if (participation_method === 'survey') {
      output = {
        participation_method,
        survey_embed_url,
        survey_service
      };
    } else if (participation_method === 'poll') {
      output = {
        participation_method,
        poll_anonymous
      };
    } else if (participation_method === 'volunteering') {
      output = {
        participation_method,
      };
    } else if (participation_method === 'budgeting') {
      output = omitBy({
        participation_method,
        max_budget,
        commenting_enabled,
        presentation_mode
      }, isNil) as IParticipationContextConfig;
    }

    return output;
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    const { noVotingLimit: prevNoVotingLimit, noBudgetingAmount: prevNoBudgetingAmount, loaded: prevLoaded, ...prevPartialState } = prevState;
    const { noVotingLimit: nextNoVotingLimit, noBudgetingAmount: nextNoBudgetingAmount, loaded: nextLoaded, ...nextPartialState } = this.state;

    if (!isEqual(prevPartialState, nextPartialState)) {
      const output = this.getOutput();
      this.props.onChange(output);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleParticipationMethodOnChange = (participation_method: ParticipationMethod) => {
    this.setState({
      participation_method,
      posting_enabled: (participation_method === 'ideation' ? true : null),
      commenting_enabled: ((participation_method === 'ideation' || participation_method === 'budgeting') ? true : null),
      voting_enabled: (participation_method === 'ideation' ? true : null),
      voting_method: (participation_method === 'ideation' ? 'unlimited' : null),
      voting_limited_max: null,
      downvoting_enabled: (participation_method === 'ideation' ? true : null),
      presentation_mode: (participation_method === 'ideation' ? 'card' : null),
      survey_embed_url: null,
      survey_service: (participation_method === 'survey' ? 'typeform' : null),
      max_budget: (participation_method === 'budgeting' ? 1000 : null)
    });
  }

  handleSurveyProviderChange = (survey_service: SurveyServices) => {
    this.setState({ survey_service });
  }

  handleSurveyEmbedUrlChange = (survey_embed_url: string) => {
    this.setState({ survey_embed_url });
  }

  togglePostingEnabled = () => {
    this.setState((state) => ({ posting_enabled: !state.posting_enabled }));
  }

  toggleCommentingEnabled = () => {
    this.setState((state) => ({ commenting_enabled: !state.commenting_enabled }));
  }

  toggleVotingEnabled = () => {
    this.setState((state) => ({ voting_enabled: !state.voting_enabled }));
  }

  handeVotingMethodOnChange = (voting_method: 'unlimited' | 'limited') => {
    this.setState({
      voting_method,
      voting_limited_max: (voting_method === 'unlimited' ? null : 5)
    });
  }

  handleVotingLimitOnChange = (voting_limited_max: string) => {
    this.setState({ voting_limited_max: parseInt(voting_limited_max, 10), noVotingLimit: null });
  }

  handleDownvotingEnabledOnChange = (downvoting_enabled: boolean) => {
    this.setState({ downvoting_enabled });
  }

  handleIdeasDisplayChange = (presentation_mode: 'map' | 'card') => {
    this.setState({ presentation_mode });
  }

  handleBudgetingAmountChange = (max_budget: string) => {
    this.setState({ max_budget: parseInt(max_budget, 10), noBudgetingAmount: null });
  }

  togglePollAnonymous = () => {
    this.setState(state => ({ poll_anonymous: !state.poll_anonymous }));
  }

  validate() {
    let isValidated = true;
    let noVotingLimit: JSX.Element | null = null;
    let noBudgetingAmount: JSX.Element | null = null;
    const { voting_method, voting_limited_max, participation_method, max_budget } = this.state;

    if (voting_method === 'limited' && (!voting_limited_max || !isFinite(voting_limited_max) || voting_limited_max < 1)) {
      noVotingLimit = <FormattedMessage {...messages.noVotingLimitErrorMessage} />;
      isValidated = false;
    } else if (participation_method === 'budgeting' && !(parseInt(max_budget as any, 10) > 0)) {
      noBudgetingAmount = <FormattedMessage {...messages.noBudgetingAmountErrorMessage} />;
      isValidated = false;
    }

    this.setState({ noVotingLimit, noBudgetingAmount });

    return isValidated;
  }

  render() {
    const {
      tenant,
      apiErrors,
      surveys_enabled,
      typeform_enabled,
      survey_monkey_enabled,
      google_forms_enabled
    } = this.props;
    const className = this.props['className'];
    const {
      participation_method,
      posting_enabled,
      commenting_enabled,
      voting_enabled,
      voting_method,
      voting_limited_max,
      downvoting_enabled,
      max_budget,
      survey_embed_url,
      survey_service,
      loaded,
      noVotingLimit,
      noBudgetingAmount,
      poll_anonymous,
      presentation_mode,
    } = this.state;
    const tenantCurrency = (!isNilOrError(tenant) ? tenant.attributes.settings.core.currency : '');

    if (loaded) {
      return (
        <Container className={className}>
          <StyledSection>
            <SectionField>
              <SubSectionTitle>
                <FormattedMessage {...messages.participationMethod} />
                <IconTooltip content={<FormattedMessage {...messages.participationMethodTooltip} />} />
              </SubSectionTitle>
              <StyledRadio
                onChange={this.handleParticipationMethodOnChange}
                currentValue={participation_method}
                value="ideation"
                name="participationmethod"
                id="participationmethod-ideation"
                label={(
                  <LabelText>
                    <span className="header">
                      <FormattedMessage {...messages.ideation} />
                    </span>
                    <span className="description">
                      <FormattedMessage {...messages.ideationDescription} />
                    </span>
                  </LabelText>)}
              />
              <FeatureFlag name="participatory_budgeting">
                <StyledRadio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participation_method}
                  value="budgeting"
                  name="participationmethod"
                  id={'participationmethod-budgeting'}
                  label={(
                    <LabelText>
                      <span className="header">
                        <FormattedMessage {...messages.participatoryBudgeting} />
                      </span>
                      <span className="description">
                        <FormattedMessage {...messages.participatoryBudgetingDescription} />
                      </span>
                    </LabelText>)}
                />
              </FeatureFlag>
              <FeatureFlag name="polls">
                <StyledRadio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participation_method}
                  value="poll"
                  name="participationmethod"
                  id={'participationmethod-poll'}
                  label={(
                    <LabelText>
                      <span className="header">
                        <FormattedMessage {...messages.poll} />
                      </span>
                      <span className="description">
                        <FormattedMessage {...messages.pollDescription} />
                      </span>
                    </LabelText>)}
                />
              </FeatureFlag>
              <FeatureFlag name="volunteering">
                <StyledRadio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participation_method}
                  value="volunteering"
                  name="participationmethod"
                  id={'participationmethod-volunteering'}
                  label={(
                    <LabelText>
                                          <span className="header">
                        <FormattedMessage {...messages.volunteering} />
                      </span>
                      <span className="description">
                        <FormattedMessage {...messages.volunteeringDescription} />
                      </span>
                    </LabelText>)}
                />
              </FeatureFlag>

              {surveys_enabled &&
                (google_forms_enabled || survey_monkey_enabled || typeform_enabled) &&
                <StyledRadio
                  onChange={this.handleParticipationMethodOnChange}
                  currentValue={participation_method}
                  value="survey"
                  name="participationmethod"
                  id={'participationmethod-survey'}
                  label={(
                    <LabelText>
                      <span className="header">
                        <FormattedMessage {...messages.survey} />
                      </span>
                      <span className="description">
                        <FormattedMessage {...messages.surveyDescription} />
                      </span>
                    </LabelText>)}
                />
              }
              <Radio
                onChange={this.handleParticipationMethodOnChange}
                currentValue={participation_method}
                value="information"
                name="participationmethod"
                id="participationmethod-information"
                label={(
                  <LabelText>
                    <span className="header">
                      <FormattedMessage {...messages.information} />
                    </span>
                    <span className="description">
                      <FormattedMessage {...messages.informationDescription} />
                    </span>
                  </LabelText>)}
              />
              <Error apiErrors={apiErrors && apiErrors.participation_method} />
            </SectionField>

            {participation_method === 'budgeting' &&
              <>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage
                      {...messages.amountPerCitizen}
                      values={{ currency: tenantCurrency }}
                    />
                  </SubSectionTitle>
                  <BudgetingAmountInput
                    onChange={this.handleBudgetingAmountChange}
                    type="number"
                    min="1"
                    placeholder=""
                    value={(max_budget ? max_budget.toString() : null)}
                  />
                  <Error text={noBudgetingAmount} apiErrors={apiErrors && apiErrors.max_budget} />
                </SectionField>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.phasePermissions} />
                  </SubSectionTitle>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.commentingEnabled} />
                    </ToggleLabel>
                    <Toggle checked={commenting_enabled as boolean} onChange={this.toggleCommentingEnabled} />
                  </ToggleRow>
                  <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
                </SectionField>
              </>
            }

            {participation_method === 'ideation' &&
              <>
                <StyledSectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.phasePermissions} />
                    <IconTooltip content={<FormattedMessage {...messages.phasePermissionsTooltip} />} />
                  </SubSectionTitle>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.postingEnabled} />
                    </ToggleLabel>
                    <Toggle checked={posting_enabled as boolean} onChange={this.togglePostingEnabled} />
                    <Error apiErrors={apiErrors && apiErrors.posting_enabled} />
                  </ToggleRow>

                  <ToggleRow>
                    <ToggleLabel>
                      <FormattedMessage {...messages.commentingEnabled} />
                    </ToggleLabel>
                    <Toggle checked={commenting_enabled as boolean} onChange={this.toggleCommentingEnabled} />
                    <Error apiErrors={apiErrors && apiErrors.commenting_enabled} />
                  </ToggleRow>

                  <ToggleRow className="last">
                    <ToggleLabel>
                      <FormattedMessage {...messages.votingEnabled} />
                    </ToggleLabel>
                    <Toggle checked={voting_enabled as boolean} onChange={this.toggleVotingEnabled} />
                    <Error apiErrors={apiErrors && apiErrors.voting_enabled} />
                  </ToggleRow>
                </StyledSectionField>
                {voting_enabled &&
                  <>
                    <SectionField>
                      <SubSectionTitle>
                        <FormattedMessage {...messages.votingMethod} />
                        <IconTooltip content={<FormattedMessage {...messages.votingMethodTooltip} />} />
                      </SubSectionTitle>
                      <Radio
                        onChange={this.handeVotingMethodOnChange}
                        currentValue={voting_method}
                        value="unlimited"
                        name="votingmethod"
                        id="votingmethod-unlimited"
                        label={<FormattedMessage {...messages.unlimited} />}
                      />
                      <Radio
                        onChange={this.handeVotingMethodOnChange}
                        currentValue={voting_method}
                        value="limited"
                        name="votingmethod"
                        id="votingmethod-limited"
                        label={<FormattedMessage {...messages.limited} />}
                      />
                      <Error apiErrors={apiErrors && apiErrors.voting_method} />

                      {participation_method === 'ideation' && voting_method === 'limited' &&
                        <>
                          <SubSectionTitle>
                            <FormattedMessage {...messages.votingLimit} />
                          </SubSectionTitle>
                          <VotingLimitInput
                            id="voting-limit"
                            type="number"
                            min="1"
                            placeholder=""
                            value={(voting_limited_max ? voting_limited_max.toString() : null)}
                            onChange={this.handleVotingLimitOnChange}
                          />
                          <Error text={noVotingLimit} apiErrors={apiErrors && apiErrors.voting_limit} />
                        </>
                      }
                    </SectionField>

                    <FeatureFlag name="disable_downvoting">
                      <SectionField>
                        <SubSectionTitle>
                          <FormattedMessage {...messages.downvoting} />
                          <IconTooltip content={<FormattedMessage {...messages.downvotingTooltip} />} />
                        </SubSectionTitle>
                        <Radio
                          onChange={this.handleDownvotingEnabledOnChange}
                          currentValue={downvoting_enabled}
                          value={true}
                          name="enableDownvoting"
                          id="enableDownvoting-true"
                          label={<FormattedMessage {...messages.downvotingEnabled} />}
                        />
                        <Radio
                          onChange={this.handleDownvotingEnabledOnChange}
                          currentValue={downvoting_enabled}
                          value={false}
                          name="enableDownvoting"
                          id="enableDownvoting-false"
                          label={<FormattedMessage {...messages.downvotingDisabled} />}
                        />
                        <Error apiErrors={apiErrors && apiErrors.downvoting_enabled} />
                      </SectionField>
                    </FeatureFlag>
                  </>
                }
              </>
            }

            {(
              participation_method === 'ideation' ||
              participation_method === 'budgeting'
            ) &&
              <SectionField>
                <SubSectionTitle>
                  <FormattedMessage {...messages.defaultDisplay} />
                  <IconTooltip content={<FormattedMessage {...messages.presentationModeTooltip} />} />
                </SubSectionTitle>
                {['card', 'map'].map((key) => (
                  <Radio
                    key={key}
                    onChange={this.handleIdeasDisplayChange}
                    currentValue={presentation_mode}
                    value={key}
                    name="presentation_mode"
                    id={`presentation_mode-${key}`}
                    label={<FormattedMessage {...messages[`${key}Display`]} />}
                  />
                ))}
                <Error apiErrors={apiErrors && apiErrors.presentation_mode} />
              </SectionField>
            }

            {participation_method === 'poll' &&
              <>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.anonymousPolling} />
                    <IconTooltip content={<FormattedMessage {...messages.anonymousPollingTooltip} />} />
                  </SubSectionTitle>

                  <Toggle checked={poll_anonymous as boolean} onChange={this.togglePollAnonymous} />

                  <Error apiErrors={apiErrors && apiErrors.poll_anonymous} />
                </SectionField>
              </>
            }

            {participation_method === 'survey' &&
              <>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.surveyService} />
                    <IconTooltip
                      content={
                        <FormattedMessage
                          {...messages.surveyServiceTooltip}
                          values={{
                            surveyServiceTooltipLink: (
                              <StyledA href={this.props.intl.formatMessage(messages.surveyServiceTooltipLink)} target="_blank">
                                <FormattedMessage {...messages.surveyServiceTooltipLinkText} />
                              </StyledA>)
                          }}
                        />
                      }
                    />
                  </SubSectionTitle>
                  {['typeform', 'survey_monkey', 'google_forms'].map((provider) => {
                    if (this.props[`${provider}_enabled`]) {
                      return (
                        <Radio
                          onChange={this.handleSurveyProviderChange}
                          currentValue={survey_service}
                          value={provider}
                          name="survey-provider"
                          id={`survey-provider-${provider}`}
                          label={<FormattedMessage {...messages[provider]} />}
                          key={provider}
                        />
                      );
                    }
                    return null;
                  })}
                  <Error apiErrors={apiErrors && apiErrors.survey_service} />
                </SectionField>
                <SectionField>
                  <SubSectionTitle>
                    <FormattedMessage {...messages.surveyEmbedUrl} />
                  </SubSectionTitle>
                  <Input
                    onChange={this.handleSurveyEmbedUrlChange}
                    type="text"
                    value={survey_embed_url}
                  />
                  <Error apiErrors={apiErrors && apiErrors.survey_embed_url} />
                </SectionField>
              </>
            }

          </StyledSection>
        </Container>
      );
    }
    return null;
  }
}

const Data = adopt<DataProps, {}>({
  surveys_enabled: <GetFeatureFlag name="surveys" />,
  typeform_enabled: <GetFeatureFlag name="typeform_surveys" />,
  google_forms_enabled: <GetFeatureFlag name="google_forms_surveys" />,
  survey_monkey_enabled: <GetFeatureFlag name="surveymonkey_surveys" />,
  tenant: <GetTenant />,
});

const ParticipationContextWithIntl = injectIntl(ParticipationContext);

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <ParticipationContextWithIntl {...inputProps} {...dataProps} />}
  </Data>
);
