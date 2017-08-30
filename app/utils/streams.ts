import { IStream } from './streams';
import { injectIntl } from 'react-intl';
import 'whatwg-fetch';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import request from 'utils/request';
import { v4 as uuid } from 'uuid';

export type pureFn<T> = (arg: T) => T;
type fetchFn<T> = () => IStream<T>;
interface IObject{ [key: string]: any; }
export type IObserver<T> = Rx.Observer<T | pureFn<T> | null>;
export type IObservable<T> = Rx.Observable<T>;
export interface IStreamParams<T> {
  bodyData?: IObject | null;
  queryParameters?: IObject | null;
  localProperties?: IObject | null;
  onEachEmit?: pureFn<T> | null;
}
interface IInputStreamParams<T> extends IStreamParams<T> {
  apiEndpoint: string;
}
interface IExtendedStreamParams<T> {
  apiEndpoint: string;
  bodyData: IObject | null;
  queryParameters: IObject | null;
  localProperties: IObject | null;
  onEachEmit: pureFn<T> | null;
}
export interface IStream<T> {
  id: string;
  params: IExtendedStreamParams<T>;
  type: 'singleObject' | 'arrayOfObjects' | 'unknown';
  fetch: fetchFn<T>;
  observer: IObserver<T> | null;
  observable: IObservable<T>;
  dataIds: { [key: string]: true };
}

class Streams {
  public streams: { [key: string]: IStream<any>};
  private resources: { [key: string]: any };

  constructor() {
    this.streams = {};
    this.resources = {};
  }

  /*
  isUUID(string) {
    const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegExp.test(string);
  }
  */

  findExistingStreamId(params: IExtendedStreamParams<any>) {
    let existingStreamId: string | null = null;

    _.forOwn(this.streams, (stream, streamId) => {
      if (_.isEqual(stream.params, params)) {
        existingStreamId = streamId;
        return false;
      }

      return true;
    });

    return existingStreamId;
  }

  hasQueryStream(streams: { [key: string]: IStream<any>}, apiEndpoint: string) {
    let hasQueryStream = false;

    _.forOwn(streams, (stream, streamId) => {
      if (stream.params.apiEndpoint === apiEndpoint && stream.params.queryParameters) {
        hasQueryStream = true;
        return false;
      }

      return true;
    });

    return hasQueryStream;
  }

  create<T>(inputParams: IInputStreamParams<T>) {
    const params: IExtendedStreamParams<T> = {
      bodyData: null,
      queryParameters: null,
      localProperties: null,
      onEachEmit: null,
      ...inputParams
    };

    const existingStreamId = this.findExistingStreamId(params);

    if (!_.isString(existingStreamId)) {
      const streamId = uuid();

      this.streams[streamId] = {
        params,
        id: streamId,
        type: 'unknown',
        fetch: null as any,
        observer: null,
        observable: null as any,
        dataIds: {},
      };

      this.streams[streamId].fetch = () => {
        const { apiEndpoint, bodyData, queryParameters } = this.streams[streamId].params;
        const promise = request<any>(apiEndpoint, bodyData, { method: 'GET' }, queryParameters);

        Rx.Observable.defer(() => promise).retry(3).subscribe(
          (response) => {
            (this.streams[streamId].observer as IObserver<any>).next(response);
          },
          (error) => {
            console.log(`promise for api endpoint ${apiEndpoint} did not resolve`);
            (this.streams[streamId].observer as IObserver<any>).next(null);
          }
        );

        return this.streams[streamId];
      };

      this.streams[streamId].observable = Rx.Observable.create((observer: IObserver<T>) => {
        const { apiEndpoint } = this.streams[streamId].params;
        const lastSegment = apiEndpoint.substr(apiEndpoint.lastIndexOf('/') + 1);

        this.streams[streamId].observer = observer;

        if (!_.isUndefined(this.resources[lastSegment])) {
          console.log('retrieved local version:');
          console.log(this.resources[lastSegment]);
          (this.streams[streamId].observer as IObserver<any>).next(this.resources[lastSegment]);
        } else {
          this.streams[streamId].fetch();
        }

        return () => {
          if (this.streams[streamId].params.queryParameters) {
            console.log(`delete queryStream with apiEndpoint ${this.streams[streamId].params.apiEndpoint}`);
            delete this.streams[streamId];
          }
        };
      })
      .startWith('initial')
      .scan((accumulated: T, current: T | pureFn<T>) => {
        let data: any = accumulated;
        const dataIds = {};
        const { onEachEmit, localProperties } = this.streams[streamId].params;

        if (_.isFunction(onEachEmit)) {
          data = onEachEmit(data);
        }

        if (!_.isFunction(current) && localProperties !== null) {
          if (_.isArray(current)) {
            data = <any>current.map((child) => ({ ...child, ...localProperties }));
          } else if (_.isObject(current)) {
            data = { ...<any>current, ...localProperties };
          } else {
            console.log('current is no Object or Array');
          }
        } else if (_.isFunction(current)) {
          data = current(data);
        } else {
          data = current;
        }

        if (_.isObject(data) && !_.isEmpty(data)) {
          const innerData = data.data;
          const included = (data.included ? data.included : null);

          if (_.isArray(innerData)) {
            this.streams[streamId].type = 'arrayOfObjects';
            innerData.filter(item => item.id).forEach((item) => {
              dataIds[item.id] = true;
              this.resources[item.id] = { data: item };
            });
          } else if (_.isObject(innerData) && _.has(innerData, 'id')) {
            this.streams[streamId].type = 'singleObject';
            dataIds[innerData.id] = true;
            this.resources[innerData.id] = data;
          }

          if (included) {
            included.filter(item => item.id).forEach(item => this.resources[item.id] = item);
            data = _.omit(data, 'included');
          }
        }

        this.streams[streamId].dataIds = dataIds;

        return data;
      })
      .filter((data) => data !== 'initial')
      .distinctUntilChanged()
      .publishReplay(1)
      .refCount();

      return <IStream<T>>this.streams[streamId];
    }

    return <IStream<T>>this.streams[existingStreamId];
  }

  async add<T>(apiEndpoint: string, bodyData: object) {
    try {
      const addedObject = await request<T>(apiEndpoint, bodyData, { method: 'POST' }, null);
      const hasQueryStream = this.hasQueryStream(this.streams, apiEndpoint);

      _.forOwn(this.streams, (stream, streamId) => {
        if (stream.params.apiEndpoint === apiEndpoint) {
          if (hasQueryStream) {
            stream.fetch();
          } else if (stream.observer) {
            stream.observer.next((emittedValue) => ({
              ...emittedValue,
              data: emittedValue.data.push(addedObject)
            }));
          }
        }
      });

      return addedObject;
    } catch (error) {
      console.log(error);
      throw `error for add() of Streams for api endpoint ${apiEndpoint}`;
    }
  }

  async update<T>(apiEndpoint: string, dataId: string, bodyData: object) {
    try {
      const updatedObject = await request<T>(apiEndpoint, bodyData, { method: 'PATCH' }, null);
      const hasQueryStream = this.hasQueryStream(this.streams, apiEndpoint);

      _.forOwn(this.streams, (stream, streamId) => {
        if ((stream.params.apiEndpoint === apiEndpoint && hasQueryStream) || (stream.dataIds[dataId] && stream.type === 'unknown')) {
          stream.fetch();
        } else if (stream.dataIds[dataId] && stream.observer && stream.type === 'singleObject') {
          stream.observer.next(updatedObject);
        } else if (stream.dataIds[dataId] && stream.observer && stream.type === 'arrayOfObjects') {
          stream.observer.next((emittedValue) => ({
            ...emittedValue,
            data: emittedValue.data.map(child => child.id === dataId ? (updatedObject as any).data : child)
          }));
        }
      });

      return updatedObject;
    } catch (error) {
      console.log(error);
      throw `error for update() of Streams for api endpoint ${apiEndpoint}`;
    }
  }

  async delete(apiEndpoint: string, dataId: string) {
    try {
      await request(apiEndpoint, null, { method: 'DELETE' }, null);
      const hasQueryStream = this.hasQueryStream(this.streams, apiEndpoint);

      _.forOwn(this.streams, (stream, streamId) => {
        if ((stream.params.apiEndpoint === apiEndpoint && hasQueryStream) || (stream.dataIds[dataId] && stream.type === 'unknown')) {
          stream.fetch();
        } else if (stream.dataIds[dataId] && stream.observer && stream.type === 'singleObject') {
          stream.observer.next(undefined);
        } else if (stream.dataIds[dataId] && stream.observer && stream.type === 'arrayOfObjects') {
          stream.observer.next((emittedValue) => ({
            ...emittedValue,
            data: emittedValue.data.filter(child => child.id !== dataId)
          }));
        }
      });

      return true;
    } catch (error) {
      console.log(error);
      throw `error for delete() of Streams for api endpoint ${apiEndpoint}`;
    }
  }
}

const streams = new Streams();
export default streams;
