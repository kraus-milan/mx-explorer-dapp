import * as React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import './chart.scss';
export interface HistoricRatingType {
  epoch: number;
  rating: number;
}

const RatingsChart = ({ historicRatings }: { historicRatings: HistoricRatingType[] }) => {
  const ratings = historicRatings ? historicRatings : [];
  const series = [
    {
      name: 'rating',
      data: ratings.map((rating) => rating.rating),
    },
  ];
  const options: ApexOptions = {
    chart: {
      id: 'basic-bar',
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      intersect: false,
      x: {
        show: false,
      },
      y: {
        formatter: function format(value, { series, seriesIndex, dataPointIndex, w }) {
          const rating = parseInt(String(value)).toString();
          return `${rating}, epoch ${ratings[dataPointIndex].epoch}`;
        },
      },
      marker: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: function format(value) {
          return parseInt(String(value)).toString();
        },
      },
    },
    xaxis: {
      tickPlacement: 'between',
      categories: ratings.map((rating) => rating.epoch),
      labels: {
        rotate: 0,
        formatter: function format(value) {
          if (ratings.length > 20) {
            return parseInt(value) % 5 === 0 ? value : '';
          }
          return value;
        },
      },
    },
  };

  return (
    <div data-testid="chartContainer">
      <div className="mt-4">
        <h4>Rating History</h4>
      </div>
      <div className="card pr-3">
        {process.env.NODE_ENV !== 'test' && (
          <Chart options={options} series={series} type="line" width="100%" height="152px" />
        )}
      </div>
    </div>
  );
};

export default RatingsChart;
