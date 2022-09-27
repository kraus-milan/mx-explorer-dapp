import React from 'react';
import moment from 'moment';

import { ResponsiveContainer, XAxis, YAxis, Area, AreaChart, Tooltip } from 'recharts';

import { ChartProps } from './helpers/types';
import CustomTooltip from './helpers/CustomTooltip';
import formatYAxis from './helpers/formatYAxis';
import getChartMergedData from './helpers/getChartMergedData';
import StartEndTick from './helpers/StartEndTick';

const ChartArea = ({
  config,
  data,
  dateFormat,
  filter,
  category,
  currency,
  size,
  tooltip,
  hasOnlyStartEndTick,
}: ChartProps) => {
  const chartData = getChartMergedData({ config, data, filter, category });
  const domain = [chartData[0].timestamp, chartData[chartData.length - 1].timestamp];

  const docStyle = window.getComputedStyle(document.documentElement);
  const mutedColor = docStyle.getPropertyValue('--muted');
  const primaryColor = docStyle.getPropertyValue('--primary');

  return (
    <div
      className={`chart-area mb-n3 ${size ? `chart-area-${size}` : ''} ${
        hasOnlyStartEndTick ? 'has-only-start-end-tick' : ''
      }`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="transparent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="100%" stopColor="transparent" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="defaultGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.25} />
              <stop offset="35%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
            {config.map((chartConfig) => {
              if (chartConfig.gradient) {
                return (
                  <linearGradient
                    key={chartConfig.gradient}
                    id={chartConfig.gradient}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={chartConfig.gradient} stopOpacity={0.25} />
                    <stop offset="35%" stopColor={chartConfig.gradient} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={chartConfig.gradient} stopOpacity={0} />
                  </linearGradient>
                );
              }

              return null;
            })}
          </defs>
          <XAxis
            minTickGap={40}
            tickCount={10}
            dataKey="timestamp"
            tickLine={false}
            domain={domain}
            tickFormatter={(tick) =>
              moment
                .unix(tick)
                .utc()
                .format(dateFormat ?? 'D MMM YYYY')
            }
            strokeWidth={0.3}
            {...(hasOnlyStartEndTick ? { tick: <StartEndTick dateformat={dateFormat} /> } : {})}
            {...(hasOnlyStartEndTick ? { interval: 0 } : {})}
            {...(chartData.length > 3 ? { scale: 'time' } : {})}
          />

          <YAxis
            orientation="right"
            tickFormatter={(tick) => formatYAxis(tick, currency)}
            axisLine={false}
            tickLine={false}
            tickCount={5}
          />
          {config.map((chartConfig) => (
            <Area
              type="monotone"
              dataKey={chartConfig.id}
              stroke={chartConfig.stroke ?? primaryColor}
              {...(chartConfig.gradient
                ? { fill: `url(#${chartConfig.gradient})` }
                : { fill: 'url(#transparent)' })}
              {...(chartConfig.strokeDasharray
                ? { strokeDasharray: chartConfig.strokeDasharray }
                : {})}
              key={chartConfig.id}
              strokeWidth={1.5}
            />
          ))}
          <Tooltip
            content={(props) => <CustomTooltip {...props} currency={currency} {...tooltip} />}
            cursor={{
              strokeDasharray: '3 5',
              stroke: mutedColor,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartArea;
