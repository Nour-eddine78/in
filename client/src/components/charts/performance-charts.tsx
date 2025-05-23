import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface PerformanceChartsProps {
  data?: any;
}

export function MethodChart() {
  const data = {
    labels: ['Transport', 'Casement', 'Poussage'],
    datasets: [{
      data: [35, 42, 23],
      backgroundColor: ['#D97706', '#1E40AF', '#059669'],
      borderWidth: 0
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  return <Doughnut data={data} options={options} />;
}

export function WeeklyChart() {
  const data = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Rendement (m/h)',
      data: [245, 267, 234, 289, 256, 278, 245],
      borderColor: '#1E40AF',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <Line data={data} options={options} />;
}

export function ProgressChart() {
  const data = {
    labels: ['Transport', 'Casement', 'Poussage'],
    datasets: [{
      label: 'Avancement (%)',
      data: [78, 65, 89],
      backgroundColor: ['#D97706', '#1E40AF', '#059669']
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return <Bar data={data} options={options} />;
}

export function PerformanceEvolutionChart() {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Disponibilité (%)',
      data: [85, 87, 89, 84, 92, 88],
      borderColor: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.1)',
      fill: true
    }, {
      label: 'Rendement (index)',
      data: [78, 82, 85, 79, 88, 85],
      borderColor: '#1E40AF',
      backgroundColor: 'rgba(30, 64, 175, 0.1)',
      fill: true
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return <Line data={data} options={options} />;
}
