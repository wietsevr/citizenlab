import React, { memo, useCallback } from 'react';
import { get } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';
import ProjectTemplatePreview from './ProjectTemplatePreview';

// graphql
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

// typings
import { Multiloc } from 'typings';

const Container = styled.div`
  width: 100%;
  max-width: 1050px;
  margin-bottom: 60px;
`;

const AdminHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  margin-left: -20px;
`;

export interface Props {
  projectTemplateId: string;
  goBack?: () => void;
  useTemplate?: () => void;
  className?: string;
}

interface IVariables {
  projectTemplateId: string | undefined;
  titleMultiloc: Multiloc;
  timelineStartAt: string;
}

const ProjectTemplatePreviewPageAdmin = memo<Props & WithRouterProps>(({ params, projectTemplateId, goBack, useTemplate, className }) => {

  const templateId: string | undefined = (projectTemplateId || get(params, 'projectTemplateId'));

  const APPLY_PROJECT_TEMPLATE = gql`
    mutation ApplyProjectTemplate(
      $projectTemplateId: ID!
      $titleMultiloc: MultilocAttributes!
      $timelineStartAt: String
    ) {
      applyProjectTemplate(
        projectTemplateId: $projectTemplateId
        titleMultiloc: $titleMultiloc
        timelineStartAt: $timelineStartAt
      ) {
        errors
      }
    }
  `;

  const [applyProjectTemplate] = useMutation<any, IVariables>(APPLY_PROJECT_TEMPLATE);

  const onGoBack = useCallback(() => {
    goBack ? goBack() : clHistory.push('/admin/projects');
  }, []);

  const onUseTemplate = useCallback(() => {
    applyProjectTemplate({
      variables: {
        projectTemplateId: templateId,
        titleMultiloc: {
          en: 'Zolg'
        },
        timelineStartAt: '2019-09-25'
      }
    }).then((result) => {
      console.log('sucess!');
      console.log(result);
      useTemplate && useTemplate();
    }).catch((error) => {
      console.log('error');
      console.log(error);
    });
  }, []);

  if (templateId) {
    return (
      <Container className={className || ''}>
        <AdminHeader>
          {goBack
            ? <Button style="text" icon="arrow-back" onClick={onGoBack}><FormattedMessage {...messages.goBack} /></Button>
            : <Button style="text" icon="list" onClick={onGoBack}><FormattedMessage {...messages.seeMoreTemplates} /></Button>
          }
          <Button onClick={onUseTemplate} style="admin-dark"><FormattedMessage {...messages.useTemplate} /></Button>
        </AdminHeader>
        <ProjectTemplatePreview projectTemplateId={templateId} />
      </Container>
    );
  }

  return null;
});

export default withRouter(ProjectTemplatePreviewPageAdmin);
