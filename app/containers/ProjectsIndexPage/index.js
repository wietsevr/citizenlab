/*
 *
 * ProjectsIndexPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import InfiniteScroll from 'react-infinite-scroller';
// import IdeaCard from 'components/IdeaCard';
import HelmetIntl from 'components/HelmetIntl';
import WatchSagas from 'utils/containers/watchSagas';
import ProjectCard from 'components/ProjectCard';
import ContentContainer from 'components/ContentContainer';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { loadProjectsRequest, resetProjects } from 'resources/projects/actions';
import sagaWatchers from 'resources/projects/sagas';

// style
import { media } from 'utils/styleUtils';
import styled from 'styled-components';
import messages from './messages';

const InfiniteScrollStyled = styled(InfiniteScroll)`
  font-size: 20px;
  color: #999;
  margin-top: 30px !important;
  display: flex;
  justify-content: space-between;
  ${media.tablet`
    flex-wrap: wrap;
  `}
  ${media.phone`
    flex-direction: column;
  `}
`;

export class ProjectsList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillUnmount() {
    this.props.reset();
  }

  render() {
    const { className, loadMoreProjects, hasMore, list } = this.props;
    return (
      <div className={className}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <WatchSagas sagas={sagaWatchers} />
        <ContentContainer>

          <InfiniteScrollStyled
            element={'div'}
            loadMore={loadMoreProjects}
            className={'ui stackable cards'}
            initialLoad
            hasMore={hasMore}
            loader={<div className="loader"></div>}
          >
            {list && list.map((id) => (
              <ProjectCard key={id} id={id} />
            ))}
          </InfiniteScrollStyled>
        </ContentContainer>
      </div>
    );
  }
}

ProjectsList.propTypes = {
  list: PropTypes.any,
  className: PropTypes.string,
  hasMore: PropTypes.bool,
  loadMoreProjects: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};


const mapStateToProps = createStructuredSelector({
  list: (state) => state.getIn(['projectsRes', 'loaded']),
  nextPageNumber: (state) => state.getIn(['projectsRes', 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['projectsRes', 'nextPageItemCount']),
});

const mergeProps = (state, dispatch) => {
  const { list, nextPageNumber, nextPageItemCount } = state;
  const { load, reset } = dispatch;
  return {
    loadMoreProjects: () => load(nextPageNumber, nextPageItemCount),
    hasMore: !!(nextPageNumber && nextPageItemCount),
    list,
    reset,
  };
};


export default preprocess(mapStateToProps, { load: loadProjectsRequest, reset: resetProjects }, mergeProps)(ProjectsList);
