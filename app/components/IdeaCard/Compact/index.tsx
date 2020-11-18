import React, { memo, FormEvent } from 'react';
import { IOpenPostPageModalEvent } from 'containers/App';

// components
import Card from 'components/UI/Card/Compact';
import Avatar from 'components/Avatar';
import FooterWithVoteControl from './FooterWithVoteControl';
import FooterWithBudgetControl from './FooterWithBudgetControl';
import ideaImagePlaceholder from './idea-placeholder.png';

// types
import { ParticipationMethod } from 'services/participationContexts';
import { IParticipationContextType } from 'typings';

// hooks
import useIdea from 'hooks/useIdea';
import useIdeaImage from 'hooks/useIdeaImage';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { FormattedRelative } from 'react-intl';

// utils
import { get } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const BodyWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 8px;
  opacity: 0.7;
`;

const Body = styled.div`
  font-size: ${fontSizes.small}px;
  color: ${colors.label};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Separator = styled.span`
  display: inline-block;
  margin: 0 4px;
`;

interface Props {
  ideaId: string;
  className?: string;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
}

const CompactIdeaCard = memo<Props & InjectedLocalized>(
  ({
    ideaId,
    localize,
    className,
    participationMethod,
    participationContextId,
    participationContextType,
  }) => {
    const idea = useIdea({ ideaId });

    const ideaImage = useIdeaImage({
      ideaId,
      ideaImageId: get(idea, 'relationships.idea_images.data[0].id'),
    });

    if (isNilOrError(idea)) {
      return null;
    }
    console.log(idea);
    const onCardClick = (event: FormEvent) => {
      event.preventDefault();

      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: idea.id,
        slug: idea.attributes.slug,
        type: 'idea',
      });
    };

    const authorId = idea.relationships.author.data?.id;
    const ideaTitle = localize(idea.attributes.title_multiloc);

    // remove html tags from wysiwyg output
    const bodyText = localize(idea.attributes.body_multiloc)
      .replace(/<[^>]*>?/gm, '')
      .trim();

    const votingDescriptor = idea?.attributes?.action_descriptor?.voting_idea;
    const commentingDescriptor =
      idea?.attributes?.action_descriptor?.commenting_idea;

    const newClassName = [
      className,
      'e2e-idea-card',
      idea?.relationships?.user_vote?.data ? 'voted' : 'not-voted',
      commentingDescriptor && commentingDescriptor.enabled
        ? 'e2e-comments-enabled'
        : 'e2e-comments-disabled',
      idea.attributes.comments_count > 0 ? 'e2e-has-comments' : null,
      votingDescriptor && votingDescriptor.downvoting_enabled
        ? 'e2e-downvoting-enabled'
        : 'e2e-downvoting-disabled',
    ]
      .filter((item) => typeof item === 'string' && item !== '')
      .join(' ');

    return (
      <Card
        onClick={onCardClick}
        className={newClassName}
        title={ideaTitle}
        to={`/ideas/${idea.attributes.slug}`}
        image={
          !isNilOrError(ideaImage)
            ? ideaImage.attributes.versions.small
            : ideaImagePlaceholder
        }
        body={
          <BodyWrapper>
            {authorId && <StyledAvatar size="37" userId={authorId} />}
            <Body>
              <strong>
                <FormattedRelative
                  value={idea.attributes.created_at}
                  style="numeric"
                />
                <Separator aria-hidden>&bull;</Separator>
              </strong>
              {bodyText}
            </Body>
          </BodyWrapper>
        }
        footer={
          participationMethod === 'budgeting' ? (
            <FooterWithBudgetControl
              idea={idea}
              openIdea={onCardClick}
              participationContextId={participationContextId}
              participationContextType={participationContextType}
            />
          ) : (
            <FooterWithVoteControl idea={idea} />
          )
        }
      />
    );
  }
);

export default injectLocalize(CompactIdeaCard);
