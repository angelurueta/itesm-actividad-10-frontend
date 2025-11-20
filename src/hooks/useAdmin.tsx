import { useState, useCallback } from "react";
import { AdminService } from "@services/admin.service";
export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDashboardStats = useCallback(async () => {
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
  }, []);

  const getAllReservations = useCallback(async (filters?: {
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
  }, []);

  const updateReservation = useCallback(async (id_reserva: number, updateData: Record<string, unknown>) => {
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
  }, []);

  const getTables = useCallback(async () => {
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
  }, []);

  const getConfiguracion = useCallback(async () => {
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
  }, []);

  const generateReport = useCallback(async (params: {
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
  }, []);

  const getPastInsights = useCallback(async () => {
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
  }, []);

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