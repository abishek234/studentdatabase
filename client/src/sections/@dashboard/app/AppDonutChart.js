import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import ReactApexChart from 'react-apexcharts';
import html2canvas from 'html2canvas';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { Card, CardHeader, IconButton, Container } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
// utils
import { fNumber } from '../../../utils/formatNumber';
// components
import { BaseOptionChart } from '../../../components/chart';

// ----------------------------------------------------------------------

const CHART_HEIGHT = 400;  // Increased height for better spacing
const LEGEND_HEIGHT = 100; // Increased height for more room

const ChartWrapperStyle = styled('div')(({ theme }) => ({
  height: CHART_HEIGHT,
  marginTop: theme.spacing(10),  // Moved chart lower
  '& .apexcharts-canvas svg': { height: CHART_HEIGHT },
  '& .apexcharts-canvas svg,.apexcharts-canvas foreignObject': {
    overflow: 'visible',
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    alignContent: 'center',
    position: 'relative !important',
    borderTop: `solid 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT }px) !important`,  // Moved legend down
  },
}));

// ----------------------------------------------------------------------

AppDonutChart.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  chartColors: PropTypes.arrayOf(PropTypes.string),
  chartData: PropTypes.array.isRequired,
};

export default function AppDonutChart({ title, subheader, chartData, chartColors, ...other }) {
  const theme = useTheme();

  const chartLabels = chartData.map((i) => i.label);
  const chartSeries = chartData.map((i) => i.value);

  const chartOptions = merge(BaseOptionChart(), {
    colors: chartColors,
    labels: chartLabels,
    stroke: { colors: [theme.palette.background.paper] },
    legend: { 
      floating: false, 
      horizontalAlign: 'center', 
      position: 'bottom' // Moves labels to bottom
    },
    dataLabels: { enabled: true },
    tooltip: {
      y: { formatter: (val) => val.toLocaleString() },
    },
    plotOptions: {
      pie: { donut: { labels: { show: true } } },
    },
  });

  // Function to capture and download chart
  const handleDownloadChart = () => {
    const chartElement = document.getElementById('donut-chart-container');

    if (!chartElement) return;

    html2canvas(chartElement, { scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'chart.png';
      link.click();
    });
  };

  return (
    <Card {...other} >
      <CardHeader 
        title={title} 
        subheader={subheader} 
        action={
          <IconButton onClick={handleDownloadChart}>
            <DownloadIcon />
          </IconButton>
        } 
      />
      <Container id="donut-chart-container">
        <ChartWrapperStyle dir="ltr" id="donut-chart">
          <ReactApexChart type="donut" series={chartSeries} options={chartOptions} height={400} />
        </ChartWrapperStyle>
      </Container>
    </Card>
  );
}
