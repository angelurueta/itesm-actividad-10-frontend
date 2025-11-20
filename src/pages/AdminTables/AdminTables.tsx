import React, { useState, useEffect } from "react";
import { Card } from "@atoms/Card";
import { Button } from "@atoms/Button";
import { Input } from "@atoms/Input";
import { Spinner } from "@atoms/Spinner";
import { Alert } from "@atoms/Alert";
import { useAdmin } from "@hooks/useAdmin";

import "./AdminTables.scss";

interface Table {
  id: number;
  capacidad: number;
  numero_mesa?: string;
  ubicacion?: string;
  activa: boolean;
  estado: string;
  created_at: string;
  updated_at?: string;
}

export const AdminTables: React.FC = () => {

  const { getTables, loading, error } = useAdmin();
  const [tables, setTables] = useState<Table[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState({
    numero_mesa: "",
    capacidad: 4,
    ubicacion: "",
    activa: true
  });

  const loadTables = React.useCallback(async () => {
    try {
      const data = await getTables();
      setTables(data || []);
    } catch (err) {
      console.error('Error loading tables:', err);
    }
  }, [getTables]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleAddTable = () => {
    setEditingTable(null);
    setFormData({
      numero_mesa: "",
      capacidad: 4,
      ubicacion: "",
      activa: true
    });
    setShowAddModal(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setFormData({
      numero_mesa: table.numero_mesa || "",
      capacidad: table.capacidad,
      ubicacion: table.ubicacion || "",
      activa: table.activa
    });
    setShowAddModal(true);
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'disponible': return '✅';
      case 'ocupada': return '🟠';
      case 'mantenimiento': return '🔧';
      case 'fuera_servicio': return '❌';
      default: return '❓';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'Disponible';
      case 'ocupada': return 'Ocupada';
      case 'mantenimiento': return 'Mantenimiento';
      case 'fuera_servicio': return 'Fuera de Servicio';
      default: return estado;
    }
  };

  const getLocationColor = (ubicacion: string) => {
    switch (ubicacion?.toLowerCase()) {
      case 'interior': return 'blue';
      case 'terraza': return 'green';
      case 'vip': return 'purple';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="admin-tables">
        <div className="container">
          <div className="admin-tables__loading">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-tables">
      <div className="container">
        <div className="admin-tables__header">
          <h1 className="admin-tables__title">Gestión de Mesas</h1>
          <p className="admin-tables__subtitle">Administra la configuración de las mesas del restaurante</p>
          <Button
            variant="primary"
            onClick={handleAddTable}
          >
            Agregar Mesa
          </Button>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {/* Statistics */}
        <div className="admin-tables__stats">
          <Card className="admin-tables__stat" padding="md">
            <div className="admin-tables__stat-content">
              <div className="admin-tables__stat-icon">🪑</div>
              <div className="admin-tables__stat-info">
                <h3 className="admin-tables__stat-title">Total Mesas</h3>
                <p className="admin-tables__stat-value">{tables.length}</p>
              </div>
            </div>
          </Card>
          <Card className="admin-tables__stat" padding="md">
            <div className="admin-tables__stat-content">
              <div className="admin-tables__stat-icon">👥</div>
              <div className="admin-tables__stat-info">
                <h3 className="admin-tables__stat-title">Capacidad Total</h3>
                <p className="admin-tables__stat-value">
                  {tables.reduce((sum, table) => sum + table.capacidad, 0)} personas
                </p>
              </div>
            </div>
          </Card>
          <Card className="admin-tables__stat" padding="md">
            <div className="admin-tables__stat-content">
              <div className="admin-tables__stat-icon">✅</div>
              <div className="admin-tables__stat-info">
                <h3 className="admin-tables__stat-title">Activas</h3>
                <p className="admin-tables__stat-value">
                  {tables.filter(table => table.activa).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tables Grid */}
        <Card className="admin-tables__grid" padding="md">
          <h3 className="admin-tables__grid-title">Mesas del Restaurante</h3>
          <div className="admin-tables__grid-container">
            {tables.map((table) => (
              <div
                key={table.id}
                className={`admin-tables__table-card admin-tables__table-card--${getLocationColor(table.ubicacion || '')}`}
              >
                <div className="admin-tables__table-header">
                  <div className="admin-tables__table-number">
                    {getStatusIcon(table.estado)} {table.numero_mesa || `Mesa ${table.id}`}
                  </div>
                  <div className="admin-tables__table-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTable(table)}
                    >
                      ✏️
                    </Button>
                  </div>
                </div>

                <div className="admin-tables__table-info">
                  <div className="admin-tables__table-capacity">
                    <span className="admin-tables__table-label">Capacidad:</span>
                    <span className="admin-tables__table-value">{table.capacidad} personas</span>
                  </div>
                  <div className="admin-tables__table-location">
                    <span className="admin-tables__table-label">Ubicación:</span>
                    <span className="admin-tables__table-value">
                      {table.ubicacion || 'No especificada'}
                    </span>
                  </div>
                  <div className="admin-tables__table-status">
                    <span className="admin-tables__table-label">Estado:</span>
                    <span className="admin-tables__table-value">
                      {getStatusText(table.estado)}
                    </span>
                  </div>
                  <div className="admin-tables__table-active">
                    <span className="admin-tables__table-label">Status:</span>
                    <span className={`admin-tables__table-value admin-tables__table-value--${table.activa ? 'active' : 'inactive'}`}>
                      {table.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="admin-tables__modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="admin-tables__modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-tables__modal-header">
                <h3 className="admin-tables__modal-title">
                  {editingTable ? 'Editar Mesa' : 'Agregar Nueva Mesa'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="admin-tables__modal-form">
                <div className="admin-tables__form-group">
                  <label className="admin-tables__form-label">Número de Mesa</label>
                  <Input
                    type="text"
                    name="numero_mesa"
                    value={formData.numero_mesa}
                    onChange={handleFormChange}
                    placeholder="Ej: Mesa 1, A1, VIP 1"
                  />
                </div>

                <div className="admin-tables__form-group">
                  <label className="admin-tables__form-label">Capacidad</label>
                  <Input
                    type="number"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleFormChange}
                    min="1"
                    max="20"
                  />
                </div>

                <div className="admin-tables__form-group">
                  <label className="admin-tables__form-label">Ubicación</label>
                  <select
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleFormChange}
                    className="admin-tables__form-select"
                  >
                    <option value="">Seleccionar ubicación</option>
                    <option value="interior">Interior</option>
                    <option value="terraza">Terraza</option>
                    <option value="vip">VIP</option>
                    <option value="bar">Bar</option>
                    <option value="privada">Sala Privada</option>
                  </select>
                </div>

                <div className="admin-tables__form-group">
                  <label className="admin-tables__form-checkbox">
                    <input
                      type="checkbox"
                      name="activa"
                      checked={formData.activa}
                      onChange={handleFormChange}
                    />
                    <span className="admin-tables__checkbox-label">Mesa activa</span>
                  </label>
                </div>
              </div>

              <div className="admin-tables__modal-actions">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    // TODO: Implement save logic when backend endpoint is available
                    console.warn('Save table functionality not implemented', formData);
                    setShowAddModal(false);
                  }}
                >
                  {editingTable ? 'Actualizar' : 'Agregar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};