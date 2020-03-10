import { useState, useEffect, useCallback } from 'react';
import { moderationsStream, IModerationData, TModerationStatuses } from 'services/moderations';
import { isNilOrError } from 'utils/helperUtils';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

interface InputProps {
  pageNumber?: number;
  pageSize?: number;
  moderationStatus?: TModerationStatuses;
}

export default function useModerations(props: InputProps) {
  const [pageNumber, setPageNumber] = useState(props.pageNumber);
  const [pageSize, setPageSize] = useState(props.pageNumber);
  const [moderationStatus, setModerationStatus] = useState(props.moderationStatus);
  const [list, setList] = useState<IModerationData[] | undefined | null | Error>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const onPageNumberChange = useCallback((newPageNumber: number) => {
    setPageNumber(newPageNumber);
  }, []);

  const onPageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPageNumber(1);
  }, []);

  const onModerationStatusChange = useCallback((newModerationStatus: TModerationStatuses) => {
    setModerationStatus(newModerationStatus);
  }, []);

  useEffect(() => {
    setPageNumber(props.pageNumber);
    setPageSize(props.pageSize);
    setModerationStatus(props.moderationStatus);
  }, [props.pageNumber, props.pageSize, props.moderationStatus]);

  useEffect(() => {
    const subscription = moderationsStream({
      queryParameters: {
        'page[number]': pageNumber || 1,
        'page[size]': pageSize,
        moderation_status: moderationStatus
      }
    }).observable.subscribe((response) => {
      const list = !isNilOrError(response) ? response.data : response;
      const currentPage = getPageNumberFromUrl(response?.links?.self) || 1;
      const lastPage = getPageNumberFromUrl(response?.links?.last) || 1;
      setList(list);
      setCurrentPage(currentPage);
      setLastPage(lastPage);
    });

    return () => subscription.unsubscribe();
  }, [pageNumber, pageSize, moderationStatus]);

  return {
    list,
    currentPage,
    lastPage,
    onPageNumberChange,
    onPageSizeChange,
    onModerationStatusChange,
    pageSize,
    moderationStatus
  };
}