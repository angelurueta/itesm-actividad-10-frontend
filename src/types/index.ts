/**
 * User roles enum
 */
export enum UserRole {
  CLIENTE = "cliente",
  GERENTE = "gerente",
  ADMINISTRADOR = "administrador",
  MESERO = "mesero",
}

/**
 * Reservation status enum
 */
export enum ReservationStatus {
  PENDIENTE = "pendiente",
  CONFIRMADA = "confirmada",
  CANCELADA = "cancelada",
}

/**
 * Table status enum
 */
export enum TableStatus {
  DISPONIBLE = "disponible",
  OCUPADA = "ocupada",
  MANTENIMIENTO = "mantenimiento",
}

/**
 * User interface
 */
export interface User {
  id_usuario: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: UserRole;
  activo: boolean;
  preferencias?: Record<string, unknown>;
  created_at?: string;
}

/**
 * Reservation interface
 */
export interface Reservation {
  id_reserva: number;
  fecha: string;
  hora: string;
  personas: number;
  estado: ReservationStatus;
  id_usuario?: string;
  nombre_invitado?: string;
  email_invitado: string;
  telefono_invitado: string;
  folio: string;
  notas?: string;
  motivo_cancelacion?: string;
  created_at: string;
}

/**
 * Table interface
 */
export interface Table {
  id: number;
  numero_mesa?: string;
  capacidad: number;
  ubicacion?: string;
  activa: boolean;
  estado: TableStatus | string;
  x?: number;
  y?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * AI Insight interface
 */
export interface AIInsight {
  id?: number;
  tipo_insight: string;
  titulo: string;
  contenido: string;
  periodo_inicio: string;
  periodo_fin: string;
  metadatos?: {
    categoria?: string;
    impacto?: string;
    [key: string]: unknown;
  };
  confianza_score: number;
  created_at?: string;
}

/**
 * Availability slot interface
 */
export interface AvailabilitySlot {
  hora: string;
  disponible: boolean;
  mesas_disponibles?: number;
  capacidad_restante?: number;
  turno?: string;
}

/**
 * Create reservation DTO
 */
export interface CreateReservationDTO {
  fecha: string;
  hora: string;
  numero_personas: number;
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente: string;
  notas?: string;
  id_usuario?: string; // Optional for backend to use if needed
}

/**
 * Check availability DTO
 */
export interface CheckAvailabilityDTO {
  fecha: string;
  numero_personas: number;
}

/**
 * Generate report DTO
 */
export interface GenerateReportDTO {
  tipo_reporte: "insights_ia" | "ocupacion_diaria" | "reporte_completo";
  fecha_desde: string;
  fecha_hasta: string;
}

/**
 * Report response interface
 */
export interface ReportResponse {
  metadata: {
    tipo_reporte: string;
    fecha_generacion: string;
    periodo: {
      desde: string;
      hasta: string;
    };
  };
  data: {
    tipo: string;
    resumen_analisis: {
      total_reservas: number;
      reservas_confirmadas: number;
      reservas_canceladas: number;
      tasa_confirmacion: number;
      tasa_cancelacion: number;
      promedio_personas: string;
    };
    insights_generados: number;
    insights: AIInsight[];
  };
}

/**
 * Dashboard stats interface
 */
export interface DashboardStats {
  today: {
    fecha: string;
    total_reservas: number;
    reservas_confirmadas: number;
    reservas_pendientes: number;
    reservas_canceladas: number;
    total_personas: number;
  };
  weekly: {
    total_reservas: number;
    reservas_confirmadas: number;
    reservas_canceladas: number;
    total_personas: number;
  };
}

/**
 * API Error interface
 */
export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Auth context type
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}
