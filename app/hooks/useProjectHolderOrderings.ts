import { useState, useEffect, useCallback } from 'react';
import { combineLatest } from 'rxjs';
import { switchMap, map, distinctUntilChanged } from 'rxjs/operators';
import { listProjectHolderOrderings } from 'services/projectHolderOrderings';
import { projectsStream, IProjectData, PublicationStatus } from 'services/projects';
import { projectFoldersStream, IProjectFolderData } from 'services/projectFolders';
import { isNilOrError } from 'utils/helperUtils';
import { unionBy, isString } from 'lodash-es';

export interface InputProps {
  pageSize?: number;
  areaFilter?: string[];
  publicationStatusFilter: PublicationStatus[];
  noEmptyFolder?: boolean;
}

export type IProjectHolderOrderingContent = {
  id: string;
  projectHolderType: 'project';
  attributes: {
    ordering: number;
  };
  projectHolder: IProjectData;
} | {
  id: string;
  projectHolderType: 'project_folder';
  attributes: {
    ordering: number;
  };
  projectHolder: IProjectFolderData;
};

export interface IOutput {
  list: IProjectHolderOrderingContent[] | undefined | null;
  hasMore: boolean;
  loadingInitial: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onChangeAreas: (areas: string[] | null) => void;
  onChangePublicationStatus: (publicationStatuses: PublicationStatus[]) => void;
}

export default function useProjectHolderOrderings({ pageSize = 1000, areaFilter, publicationStatusFilter, noEmptyFolder }: InputProps) {
  const [list, setList] = useState<IProjectHolderOrderingContent[] | undefined | null>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [areas, setAreas] = useState<string[] | undefined>(areaFilter);
  const [publicationStatuses, setPublicationStatuses] = useState<PublicationStatus[]>(publicationStatusFilter);

  const onLoadMore = useCallback(() => {
    if (hasMore) {
      setLoadingMore(true);
      setPageNumber(prevPageNumber => prevPageNumber + 1);
    }
  }, [hasMore]);

  const onChangeAreas = useCallback((areas) => {
    setAreas(areas);
    setPageNumber(1);
  }, []);

  const onChangePublicationStatus = useCallback((publicationStatuses) => {
    setPublicationStatuses(publicationStatuses);
    setPageNumber(1);
  }, []);

  // reset pageNumber on pageSize change
  useEffect(() => {
    setPageNumber(1);
  }, [pageSize]);

  useEffect(() => {
    const subscription = listProjectHolderOrderings({
      queryParameters: {
        areas,
        publication_statuses: publicationStatuses,
        'page[number]': pageNumber,
        'page[size]': pageSize
      }
    }).observable.pipe(
      distinctUntilChanged(),
      switchMap((projectHolderOrderings) => {
        const projectIds = projectHolderOrderings.data
          .filter(holder => holder.relationships.project_holder.data.type === 'project')
          .map(holder => holder.relationships.project_holder.data.id);

        const projectFoldersIds = projectHolderOrderings.data
          .filter(holder => holder.relationships.project_holder.data.type === 'project_folder')
          .map(holder => holder.relationships.project_holder.data.id);

        return combineLatest(
          projectsStream({
            queryParameters: {
              filter_ids: projectIds,
            }
          }).observable,
          projectFoldersStream({
            queryParameters: {
              filter_ids: projectFoldersIds
            }
          }).observable
        ).pipe(
          map((projects) => ({ projectHolderOrderings, projects: projects[0].data, projectFolders: projects[1].data }))
        );
      })
    ).subscribe(({ projectHolderOrderings, projects, projectFolders }) => {
      if (isNilOrError(projectHolderOrderings)) {
        setList(null);
        setHasMore(false);
      } else {
        const selfLink = projectHolderOrderings?.links?.self;
        const lastLink = projectHolderOrderings?.links?.last;

        const receivedItems = projectHolderOrderings.data.map(ordering => {
          const holderType = ordering.relationships.project_holder.data.type;
          const holderId = ordering.relationships.project_holder.data.id;
          const holder = holderType === 'project'
            ? projects.find(project => project.id === holderId)
            : projectFolders.find(projectFolder => projectFolder.id === holderId);

          if (!holder) {
            return null;
          }

          if (noEmptyFolder && holder.type === 'project_folder' && holder.relationships.projects.data.length === 0) {
            return null;
          }

          return {
            id: ordering.id,
            projectHolderType: holderType,
            attributes: {
              ordering: ordering.attributes.ordering,
            },
            projectHolder: holder
          };
        }).filter(item => item) as IProjectHolderOrderingContent[];

        const hasMore = !!(isString(selfLink) && isString(lastLink) && selfLink !== lastLink);
        setHasMore(hasMore);
        setList(prevList => !isNilOrError(prevList) && loadingMore ? unionBy(prevList, receivedItems, 'id') : receivedItems);
      }
      setLoadingInitial(false);
      setLoadingMore(false);
    });

    return () => subscription.unsubscribe();
  }, [pageNumber, pageSize, areas, publicationStatuses]);

  return {
    list,
    hasMore,
    loadingInitial,
    loadingMore,
    onLoadMore,
    onChangeAreas,
    onChangePublicationStatus
  };
}