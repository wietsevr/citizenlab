import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IGeotaggedIdeaData, ideasMarkersStream } from 'services/ideas';

interface InputProps {
  phaseId?: string;
  projectId?: string;
}

type children = (renderProps: GetIdeaMarkersChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children: children;
}

interface State {
  ideaMarkers: IGeotaggedIdeaData[] | undefined| null;
}

export type GetIdeaMarkersChildProps = IGeotaggedIdeaData[] | undefined| null;

export default class GetIdeaMarkers extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaMarkers: undefined
    };
  }

  componentDidMount() {
    const { projectId, phaseId } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId, phaseId });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        switchMap(({ projectId, phaseId }) => {
          return ideasMarkersStream({
            queryParameters: {
              project: projectId,
              phase: phaseId
            }
          }).observable;
        })
      ).subscribe((ideaMarkers) => {
        this.setState({
          ideaMarkers: (ideaMarkers ? ideaMarkers.data : null),
        });
      })
    ];
  }

  componentDidUpdate() {
    const { projectId, phaseId } = this.props;
    this.inputProps$.next({ projectId, phaseId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaMarkers } = this.state;
    return (children as children)(ideaMarkers);
  }
}