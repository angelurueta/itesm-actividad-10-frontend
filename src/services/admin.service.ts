import { SUPABASE_CONFIG } from "@config/index";
import type {
  GenerateReportDTO,
  ReportResponse,
  DashboardStats,
} from "@/types";

/**
 * Administration service
 */
export class AdminService {
  private static readonly BASE_URL = `${SUPABASE_CONFIG.url}/functions/v1`;

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(
    fecha_inicio?: string,
    fecha_fin?: string
  ): Promise<DashboardStats> {
    const response = await fetch(`${this.BASE_URL}/admin-panel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
      body: JSON.stringify({
        action: "get_dashboard_stats",
        fecha_inicio,
        fecha_fin,
      }),
    });

    if (!response.ok) {
      throw new Error("Error fetching dashboard stats");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Generar reporte con insights de IA
   */
  static async generateReport(
    params: GenerateReportDTO
  ): Promise<ReportResponse> {
    const response = await fetch(`${this.BASE_URL}/generar-reporte`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Error generating report");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Obtener todas las reservaciones (admin)
   */
  static async getAllReservations(filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
  }) {
    const { supabase } = await import("./supabase");

    let query = supabase
      .from("reservas")
      .select("*")
      .order("fecha", { ascending: false });

    if (filters?.fecha_inicio) {
      query = query.gte("fecha", filters.fecha_inicio);
    }

    if (filters?.fecha_fin) {
      query = query.lte("fecha", filters.fecha_fin);
    }

    if (filters?.estado) {
      query = query.eq("estado", filters.estado);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  /**
   * Send notification
   */
  static async sendNotification(data: {
    tipo: "confirmacion" | "recordatorio" | "cancelacion";
    reserva_id: number;
    destinatario: string;
    datos_reserva: {
      folio: string;
      fecha: string;
      hora: string;
    };
  }) {
    const response = await fetch(`${this.BASE_URL}/enviar-notificacion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Error sending notification");
    }

    return await response.json();
  }

  /**
   * Update reservation
   */
  static async updateReservation(id_reserva: number, updateData: any) {
    const response = await fetch(`${this.BASE_URL}/admin-panel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
      body: JSON.stringify({
        action: "update_reservation",
        id_reserva,
        ...updateData
      }),
    });

    if (!response.ok) {
      throw new Error("Error updating reservation");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get tables
   */
  static async getTables() {
    const response = await fetch(`${this.BASE_URL}/admin-panel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
      body: JSON.stringify({
        action: "get_tables"
      }),
    });

    if (!response.ok) {
      throw new Error("Error fetching tables");
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get configuration
   */
  static async getConfiguracion() {
    const response = await fetch(`${this.BASE_URL}/admin-panel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
      body: JSON.stringify({
        action: "get_configuracion"
      }),
    });

    if (!response.ok) {
      throw new Error("Error fetching configuration");
    }

    const result = await response.json();
    return result.data;
  }
  /**
   * Get past insights
   */
  static async getPastInsights() {
    const { supabase } = await import("./supabase");

    const { data, error } = await supabase
      .from("insights_ia")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }
}
