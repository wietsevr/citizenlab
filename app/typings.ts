import { appLocalePairs } from 'containers/App/constants';

declare global {
  interface Function {
    displayName?: string;
  }
}

export interface IRelationship {
  id: string;
  type: string;
}

export interface IHttpMethod {
  method: 'PUT' | 'POST' | 'GET' | 'PATCH' | 'DELETE';
}

export interface ITheme {
  theme: {
    color: {
      main: string;
      menuBg: string;
    }
  };
}

export interface UploadFile extends File {
  filename: string;
  base64: string;
  url: string;
  id?: string;
  remote: boolean;
}

export interface IOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface Message {
  id: string;
  defaultMessage: string;
}

export type Locale = keyof typeof appLocalePairs;

export const isLocale = (test: any) => {
  return Object.keys(appLocalePairs).includes(test);
};

export type Multiloc = {
  [key in Locale]?: string
};

export type MultilocStringOrJSX = {
  [key in Locale]?: string | JSX.Element;
};

export type MultilocFormValues = {
  [field: string]: Multiloc;
};

export interface CLError {
  error: string;
  value?: string;
  row?: number;
  rows?: number[];
}

export interface CLErrors {
  [fieldName: string]: CLError[];
}

export interface CLErrorsJSON {
  json: {
    errors: CLErrors
  };
}

export interface ImageSizes {
  small: string | null;
  medium: string | null;
  large: string | null;
  fb?: string | null;
}

export interface CRUDParams {
  loading: boolean;
  errors: CLErrors | null;
  saved: boolean;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type IGraphPoint = {
  name: string,
  value: number,
  code: string
};

export type IGraphFormat = IGraphPoint[];