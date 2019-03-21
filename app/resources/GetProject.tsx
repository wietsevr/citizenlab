import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { isNilOrError } from 'utils/helperUtils';
import shallowCompare from 'utils/shallowCompare';
import { projectByIdStream, projectBySlugStream, IProjectData } from 'services/projects';

interface InputProps {
  id?: string | null;
  slug?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetProjectChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  project: IProjectData | undefined | null | Error;
}

export type GetProjectChildProps = IProjectData | undefined | null | Error;

export default class GetProject extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      project: undefined
    };
  }

  componentDidMount() {
    const { id, slug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        tap(() => resetOnChange && this.setState({ project: undefined })),
        switchMap(({ id, slug }) => {
          if (isString(id)) {
            return projectByIdStream(id).observable;
          } else if (isString(slug)) {
            return projectBySlugStream(slug).observable;
          }

          return of(null);
        })
      )
      .subscribe((project) => {
        this.setState({ project: !isNilOrError(project) ? project.data : project });
      })
    ];
  }

  componentDidUpdate() {
    const { id, slug } = this.props;
    this.inputProps$.next({ id, slug });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { project } = this.state;
    return (children as children)(project);
  }
}