import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/projects`;

export interface IProjectFileData {
  id: string;
  type: string;
  attributes: {
    file: {
      url: string,
    }
    ordering: string | null,
    name: string,
    size: number,
    created_at: string,
    updated_at: string,
  };
}

export interface IProjectFile {
  data: IProjectFileData;
}

export interface IProjectFiles {
  data: IProjectFileData[];
}

export function projectFilesStream(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IProjectFiles | null>({ apiEndpoint: `${apiEndpoint}/${projectId}/files`, ...streamParams });
}

export function projectFileStream(projectId: string, fileId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IProjectFile>({ apiEndpoint: `${apiEndpoint}/${projectId}/files/${fileId}`, ...streamParams });
}

export function addProjectFile(projectId: string, base64: string, name: string, ordering: number | null = null) {
  return streams.add<IProjectFile>(`${apiEndpoint}/${projectId}/files`, { file: { name, ordering, file: base64 } });
}

export function deleteProjectFile(projectId: string, fileId: string) {
  return streams.delete(`${apiEndpoint}/${projectId}/files/${fileId}`, fileId);
}