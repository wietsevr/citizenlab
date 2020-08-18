// libraries
import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { map, isEmpty } from 'lodash-es';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import { reportError } from 'utils/loggingUtils';
import { saveAs } from 'file-saver';

// styling
import { withTheme } from 'styled-components';
import { rgba } from 'polished';

// components
import {
  AreaChart,
  CartesianGrid,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  IGraphUnit,
  IResolution,
  GraphCard,
  NoDataContainer,
  GraphCardInner,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardFigureContainer,
  GraphCardFigure,
  GraphCardFigureChange,
} from '../..';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByTime, IIdeasByTime, ICommentsByTime } from 'services/stats';
import { IGraphFormat } from 'typings';

type State = {
  serie: IGraphFormat | null;
  exporting: boolean;
};

type IResourceByTime = IUsersByTime | IIdeasByTime | ICommentsByTime;

type Props = {
  className?: string;
  graphUnit: IGraphUnit;
  graphTitleMessageKey: string;
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilter: string | undefined;
  currentGroupFilter: string | undefined;
  currentTopicFilter: string | undefined;
  stream: (streamParams?: IStreamParams | null) => IStream<IResourceByTime>;
  onDownloadSvg: (name: string, ref: any) => void;
};

export class CumulativeAreaChart extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  // private currentChart: SVGSVGElement | null = null;
  subscription: Subscription;
  currentChart = React.createRef<SVGSVGElement>();

  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.state = {
      serie: null,
      exporting: false,
    };
  }

  componentDidMount() {
    const {
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
    } = this.props;

    this.resubscribe(
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter
    );
  }

  componentDidUpdate(prevProps: Props) {
    const {
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
    } = this.props;

    if (
      startAt !== prevProps.startAt ||
      endAt !== prevProps.endAt ||
      resolution !== prevProps.resolution ||
      currentGroupFilter !== prevProps.currentGroupFilter ||
      currentTopicFilter !== prevProps.currentTopicFilter ||
      currentProjectFilter !== prevProps.currentProjectFilter
    ) {
      this.resubscribe(
        startAt,
        endAt,
        resolution,
        currentGroupFilter,
        currentTopicFilter,
        currentProjectFilter
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (data: IResourceByTime) => {
    const { graphUnit } = this.props;

    if (!isEmpty(data.series[graphUnit])) {
      return map(data.series[graphUnit], (value, key) => ({
        value,
        name: key,
        code: key,
      }));
    }

    return null;
  };

  resubscribe(
    startAt: string | null | undefined,
    endAt: string | null,
    resolution: IResolution,
    currentGroupFilter: string | undefined,
    currentTopicFilter: string | undefined,
    currentProjectFilter: string | undefined
  ) {
    const { stream } = this.props;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = stream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
        project: currentProjectFilter,
        group: currentGroupFilter,
        topic: currentTopicFilter,
      },
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie);
      this.setState({ serie: convertedSerie });
    });
  }

  formatTick = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'short',
    });
  };

  formatLabel = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  formatSerieChange = (serieChange: number) => {
    if (serieChange > 0) {
      return `(+${serieChange.toString()})`;
    } else if (serieChange < 0) {
      return `(${serieChange.toString()})`;
    }
    return null;
  };

  getFormattedNumbers(serie: IGraphFormat | null) {
    if (serie) {
      const firstSerieValue = serie[0].value;
      const lastSerieValue = serie[serie.length - 1].value;
      const serieChange = lastSerieValue - firstSerieValue;
      let typeOfChange: 'increase' | 'decrease' | '' = '';

      if (serieChange > 0) {
        typeOfChange = 'increase';
      } else if (serieChange < 0) {
        typeOfChange = 'decrease';
      }

      return {
        typeOfChange,
        totalNumber: lastSerieValue,
        formattedSerieChange: this.formatSerieChange(serieChange),
      };
    }

    return {
      totalNumber: null,
      formattedSerieChange: null,
      typeOfChange: '',
    };
  }

  downloadXlsx = async () => {
    // const { exportQueryParameter } = this.props;
    const {
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
    } = this.props;

    const queryParametersObject = {
      start_at: startAt,
      end_at: endAt,
      interval: resolution,
      project: currentProjectFilter,
      group: currentGroupFilter,
      topic: currentTopicFilter,
      as_xlsx: true,
    };
    // if (isString(exportQueryParameter) && exportQueryParameter !== 'all') {
    //   queryParametersObject['project'] = exportQueryParameter;
    // } else if (!isString(exportQueryParameter)) {
    //   queryParametersObject['ideas'] = exportQueryParameter;
    // }

    try {
      this.setState({ exporting: true });
      const blob = await requestBlob(
        `${API_PATH}/stats/users_by_time_cumulative`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        queryParametersObject
      );
      saveAs(blob, 'ideas-export.xlsx');
      this.setState({ exporting: false });
    } catch (error) {
      reportError(error);
      this.setState({ exporting: false });
    }

    // track this click for user analytics
    // trackEventByName(tracks.clickExportIdeas.name);
  };

  render() {
    const {
      graphTitleMessageKey,
      graphUnit,
      className,
      intl: { formatMessage },
    } = this.props;
    const { serie } = this.state;
    const {
      chartFill,
      chartLabelSize,
      chartLabelColor,
      chartStroke,
      animationBegin,
      animationDuration,
    } = this.props['theme'];
    const formattedNumbers = this.getFormattedNumbers(serie);
    const {
      totalNumber,
      formattedSerieChange,
      typeOfChange,
    } = formattedNumbers;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages[graphTitleMessageKey]} />
            </GraphCardTitle>
            <GraphCardFigureContainer>
              <GraphCardFigure>{totalNumber}</GraphCardFigure>
              <GraphCardFigureChange className={typeOfChange}>
                {formattedSerieChange}
              </GraphCardFigureChange>
            </GraphCardFigureContainer>
          </GraphCardHeader>
          {!serie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <>
              <div>
                <button
                  onClick={() =>
                    this.props.onDownloadSvg(
                      formatMessage(messages[graphTitleMessageKey]),
                      this.currentChart.container.children[0]
                    )
                  }
                >
                  Download svg
                </button>
              </div>
              <div>
                <button onClick={this.downloadXlsx}>Download xls</button>
              </div>
              <ResponsiveContainer>
                <AreaChart
                  data={serie}
                  margin={{ right: 40 }}
                  ref={(chart) => (this.currentChart = chart)}
                >
                  <CartesianGrid strokeDasharray="5 5" />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={formatMessage(messages[graphUnit])}
                    dot={false}
                    fill={rgba(chartFill, 0.25)}
                    fillOpacity={1}
                    stroke={chartStroke}
                    animationDuration={animationDuration}
                    animationBegin={animationBegin}
                  />
                  <XAxis
                    dataKey="name"
                    interval="preserveStartEnd"
                    stroke={chartLabelColor}
                    fontSize={chartLabelSize}
                    tick={{ transform: 'translate(0, 7)' }}
                    tickFormatter={this.formatTick}
                  />
                  <YAxis stroke={chartLabelColor} fontSize={chartLabelSize} />
                  <Tooltip
                    isAnimationActive={false}
                    labelFormatter={this.formatLabel}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(CumulativeAreaChart as any) as any);
