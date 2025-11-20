import { useState } from "react";
import { AdminService } from "@services/admin.service";
import { useLanguage } from "@/i18n";

export const useAdmin = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getDashboardStats();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading dashboard stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllReservations = async (filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getAllReservations(filters);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading reservations';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (id_reserva: number, updateData: any) => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.updateReservation(id_reserva, updateData);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating reservation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getTables();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading tables';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getConfiguracion = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getConfiguracion();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading configuration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (params: {
    tipo_reporte: "insights_ia" | "ocupacion_diaria" | "reporte_completo";
    fecha_desde: string;
    fecha_hasta: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.generateReport(params);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generating report';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getPastInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AdminService.getPastInsights();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading past insights';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getDashboardStats,
    getAllReservations,
    updateReservation,
    getTables,
    getConfiguracion,
    generateReport,
    getPastInsights
  };
};