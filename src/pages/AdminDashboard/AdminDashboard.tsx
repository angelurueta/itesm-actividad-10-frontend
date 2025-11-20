import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card } from "@atoms/Card";
import { Spinner } from "@atoms/Spinner";
import { Alert } from "@atoms/Alert";
import { useAdmin } from "@hooks/useAdmin";
import { DashboardStats, Reservation } from "@/types";
import { AdminService } from "@/services/admin.service";
import { addDays, format, startOfDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import "./AdminDashboard.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const AdminDashboard: React.FC = () => {
  const { getDashboardStats, loading, error } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Chart State
  const [chartTimeRange, setChartTimeRange] = useState<'1week' | '2weeks' | '1month'>('2weeks');
  const [chartData, setChartData] = useState<any>(null);
  const [loadingChart, setLoadingChart] = useState(false);

  // Timeline State
  const [timelineReservations, setTimelineReservations] = useState<Reservation[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      console.log('AdminDashboard: Loading stats...');
      try {
        const data = await getDashboardStats();
        console.log('AdminDashboard: Data received:', data);
        setStats(data);
      } catch (err) {
        console.error('AdminDashboard: Error loading stats:', err);
      }
    };

    loadStats();
    loadTimelineData();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [chartTimeRange]);

  const loadTimelineData = async () => {
    setLoadingTimeline(true);
    try {
      const today = startOfDay(new Date());
      const endDate = addDays(today, 7); // Show next 7 days in timeline

      const reservations = await AdminService.getAllReservations({
        fecha_inicio: format(today, 'yyyy-MM-dd'),
        fecha_fin: format(endDate, 'yyyy-MM-dd')
      }) as Reservation[];

      // Filter and sort
      const filtered = reservations
        .filter(r => r.estado === 'confirmada' || r.estado === 'pendiente')
        .sort((a, b) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`);
          const dateB = new Date(`${b.fecha}T${b.hora}`);
          return dateA.getTime() - dateB.getTime();
        });

      setTimelineReservations(filtered);
    } catch (err) {
      console.error('Error loading timeline data:', err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const loadChartData = async () => {
    setLoadingChart(true);
    try {
      const today = startOfDay(new Date());
      let daysToAdd = 14;

      if (chartTimeRange === '1week') daysToAdd = 7;
      if (chartTimeRange === '1month') daysToAdd = 30;

      const endDate = addDays(today, daysToAdd);

      // Fetch future reservations
      const reservations = await AdminService.getAllReservations({
        fecha_inicio: format(today, 'yyyy-MM-dd'),
        fecha_fin: format(endDate, 'yyyy-MM-dd')
      }) as Reservation[];

      // Process data
      const labels = [];
      const confirmedData = [];
      const pendingData = [];
      const cancelledData = [];

      for (let i = 0; i <= daysToAdd; i++) {
        const date = addDays(today, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'dd MMM', { locale: es });

        labels.push(displayDate);

        const dayReservations = reservations.filter(r => r.fecha === dateStr);

        confirmedData.push(dayReservations.filter(r => r.estado === 'confirmada').length);
        pendingData.push(dayReservations.filter(r => r.estado === 'pendiente').length);
        cancelledData.push(dayReservations.filter(r => r.estado === 'cancelada').length);
      }

      setChartData({
        labels,
        datasets: [
          {
            label: 'Confirmadas',
            data: confirmedData,
            backgroundColor: 'rgba(16, 185, 129, 0.7)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1,
          },
          {
            label: 'Pendientes',
            data: pendingData,
            backgroundColor: 'rgba(245, 158, 11, 0.7)',
            borderColor: 'rgb(245, 158, 11)',
            borderWidth: 1,
          },
          {
            label: 'Canceladas',
            data: cancelledData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 1,
          },
        ],
      });

    } catch (err) {
      console.error('Error loading chart data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="admin-dashboard__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <Alert variant="error">{error}</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-dashboard__layout">
          {/* Sidebar Timeline */}
          <aside className="admin-dashboard__sidebar">
            <Card className="admin-dashboard__timeline-card" padding="md">
              <h3 className="admin-dashboard__timeline-title">Próximas Reservas</h3>
              <div className="admin-dashboard__timeline">
                {loadingTimeline ? (
                  <div className="admin-dashboard__timeline-loading">
                    <Spinner size="sm" />
                  </div>
                ) : timelineReservations.length > 0 ? (
                  timelineReservations.map((res) => (
                    <div key={res.id_reserva} className="admin-dashboard__timeline-item">
                      <div className={`admin-dashboard__timeline-dot admin-dashboard__timeline-dot--${res.estado}`}></div>
                      <div className="admin-dashboard__timeline-content">
                        <div className="admin-dashboard__timeline-time">
                          {format(parseISO(res.fecha), 'dd MMM', { locale: es })} - {res.hora.slice(0, 5)}
                        </div>
                        <div className="admin-dashboard__timeline-info">
                          <span className="admin-dashboard__timeline-name">
                            {res.nombre_invitado || 'Cliente'}
                          </span>
                          <span className="admin-dashboard__timeline-details">
                            👥 {res.personas} pers.
                          </span>
                        </div>
                        <div className="admin-dashboard__timeline-status">
                          <span className={`status-badge status-badge--${res.estado}`}>
                            {res.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="admin-dashboard__timeline-empty">No hay reservas próximas</p>
                )}
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="admin-dashboard__main">
            <div className="admin-dashboard__header">
              <h1 className="admin-dashboard__title">Panel de Administración</h1>
              <p className="admin-dashboard__subtitle">Resumen de actividad del restaurante</p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            {stats && (
              <>
                {/* KPIs Section */}
                <div className="admin-dashboard__kpis">
                  <Card className="admin-dashboard__kpi" padding="md">
                    <div className="admin-dashboard__kpi-content">
                      <div className="admin-dashboard__kpi-icon">📅</div>
                      <div className="admin-dashboard__kpi-info">
                        <h3 className="admin-dashboard__kpi-title">Reservas Hoy</h3>
                        <p className="admin-dashboard__kpi-value">{stats.today.total_reservas}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="admin-dashboard__kpi" padding="md">
                    <div className="admin-dashboard__kpi-content">
                      <div className="admin-dashboard__kpi-icon">👥</div>
                      <div className="admin-dashboard__kpi-info">
                        <h3 className="admin-dashboard__kpi-title">Comensales Esperados</h3>
                        <p className="admin-dashboard__kpi-value">{stats.today.total_personas}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="admin-dashboard__kpi" padding="md">
                    <div className="admin-dashboard__kpi-content">
                      <div className="admin-dashboard__kpi-icon">✅</div>
                      <div className="admin-dashboard__kpi-info">
                        <h3 className="admin-dashboard__kpi-title">Confirmadas</h3>
                        <p className="admin-dashboard__kpi-value">{stats.today.reservas_confirmadas}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="admin-dashboard__kpi" padding="md">
                    <div className="admin-dashboard__kpi-content">
                      <div className="admin-dashboard__kpi-icon">⏳</div>
                      <div className="admin-dashboard__kpi-info">
                        <h3 className="admin-dashboard__kpi-title">Pendientes</h3>
                        <p className="admin-dashboard__kpi-value">{stats.today.reservas_pendientes}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Charts Section */}
                <div className="admin-dashboard__charts-section">
                  <Card className="admin-dashboard__chart-container" padding="lg">
                    <div className="admin-dashboard__chart-header">
                      <h3 className="admin-dashboard__chart-title">Proyección de Reservas</h3>
                      <div className="admin-dashboard__chart-controls">
                        <select
                          className="admin-dashboard__chart-select"
                          value={chartTimeRange}
                          onChange={(e) => setChartTimeRange(e.target.value as any)}
                        >
                          <option value="1week">Próxima Semana</option>
                          <option value="2weeks">Próximas 2 Semanas</option>
                          <option value="1month">Próximo Mes</option>
                        </select>
                      </div>
                    </div>

                    <div className="admin-dashboard__chart-wrapper">
                      {loadingChart ? (
                        <div className="admin-dashboard__chart-loading">
                          <Spinner size="md" />
                        </div>
                      ) : chartData ? (
                        <Bar data={chartData} options={chartOptions} />
                      ) : (
                        <p>No hay datos disponibles</p>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="admin-dashboard__activity" padding="lg">
                  <h3 className="admin-dashboard__activity-title">Actividad Reciente</h3>
                  <div className="admin-dashboard__activity-stats">
                    <div className="admin-dashboard__activity-stat">
                      <span className="admin-dashboard__activity-label">Esta Semana:</span>
                      <span className="admin-dashboard__activity-value">{stats.weekly.total_reservas} reservas</span>
                    </div>
                    <div className="admin-dashboard__activity-stat">
                      <span className="admin-dashboard__activity-label">Confirmaciones:</span>
                      <span className="admin-dashboard__activity-value">{stats.weekly.reservas_confirmadas}</span>
                    </div>
                    <div className="admin-dashboard__activity-stat">
                      <span className="admin-dashboard__activity-label">Cancelaciones:</span>
                      <span className="admin-dashboard__activity-value">{stats.weekly.reservas_canceladas}</span>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};