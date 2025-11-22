import React, { useState, useEffect } from "react";
import { Table } from "@/types";
import { Card } from "@atoms/Card";
import { Button } from "@atoms/Button";
import { Input } from "@atoms/Input";
import { Spinner } from "@atoms/Spinner";
import { Alert } from "@atoms/Alert";
import { useAdmin } from "@hooks/useAdmin";
import { AdminService } from "@/services/admin.service";

import { TableMap } from "@organisms/TableMap/TableMap";
import { ZoneConfigPanel, ZoneConfig } from "@organisms/ZoneConfigPanel/ZoneConfigPanel";
import { getZoneFromCoordinates } from "@/utils/zones";
import "./AdminTables.scss";

export const AdminTables: React.FC = () => {

  const { getTables, loading, error } = useAdmin();
  const [tables, setTables] = useState<Table[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [formData, setFormData] = useState({
    numero_mesa: "",
    capacidad: 4,
    ubicacion: "",
    activa: true
  });

  // Initial zone capacities (could be fetched from backend later)
  const [zoneCapacities, setZoneCapacities] = useState<ZoneConfig>({
    'Terraza': 10,
    'Interior': 15,
    'VIP': 5,
    'Sala Privada': 2,
    'Bar': 8
  });

  const handleTableMove = async (id: number, x: number, y: number) => {
    const table = tables.find(t => t.id === id);
    if (!table) return;

    const newZone = getZoneFromCoordinates(x, y);
    const currentZone = table.ubicacion || 'Desconocida';

    // If zone hasn't changed, just update position
    if (newZone.toLowerCase() === currentZone.toLowerCase()) {
      try {
        // Optimistic update
        setTables(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
        await AdminService.saveTable({ id, x, y });
      } catch (error) {
        console.error('Error updating table position:', error);
        // Revert on error (could be improved with a proper revert mechanism)
        loadTables();
      }
      return;
    }

    // Check capacity of new zone
    const tablesInNewZone = tables.filter(t =>
      t.id !== id && (t.ubicacion?.toLowerCase() === newZone.toLowerCase())
    ).length;

    const maxCapacity = zoneCapacities[Object.keys(zoneCapacities).find(k => k.toLowerCase() === newZone.toLowerCase()) || ''] || 100;

    if (tablesInNewZone >= maxCapacity) {
      alert(`No se puede mover la mesa. La zona ${newZone} ha alcanzado su capacidad máxima de ${maxCapacity} mesas.`);
      return;
    }

    // Confirm move
    if (window.confirm(`¿Estás seguro de mover la mesa ${table.numero_mesa} de ${currentZone} a ${newZone}?`)) {
      try {
        // Optimistic update
        setTables(prev => prev.map(t => t.id === id ? { ...t, x, y, ubicacion: newZone } : t));
        await AdminService.saveTable({ id, x, y, ubicacion: newZone });
      } catch (error) {
        console.error('Error updating table zone:', error);
        loadTables();
      }
    }
  };

  const handleSaveTable = async () => {
    try {
      if (editingTable) {
        // Update existing table
        const updatedTable = { ...editingTable, ...formData, ubicacion: formData.ubicacion || editingTable.ubicacion };
        // Optimistic update
        setTables(prev => prev.map(t => t.id === editingTable.id ? updatedTable : t));

        await AdminService.saveTable({
          id: editingTable.id,
          ...formData
        });
      } else {
        // Add new table
        // For new tables, we wait for the backend response to get the ID
        const newTableData = {
          ...formData,
          estado: 'disponible',
          x: 50, // Default center
          y: 50
        };

        const savedTable = await AdminService.saveTable(newTableData);
        setTables(prev => [...prev, savedTable]);
      }
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving table:', error);
      alert('Error al guardar la mesa. Por favor intente de nuevo.');
      loadTables(); // Reload to ensure consistency
    }
  };

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

        {/* View Toggle */}
        <div className="admin-tables__view-toggle" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
            size="sm"
          >
            Vista de Lista
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('map')}
            size="sm"
          >
            Vista de Mapa
          </Button>
        </div>

        {/* Tables Content */}
        {viewMode === 'list' ? (
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
        ) : (
          <div className="admin-tables__map-container" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1rem' }}>
            <Card className="admin-tables__map" padding="md">
              <h3 className="admin-tables__grid-title">Mapa del Restaurante</h3>
              <p style={{ marginBottom: '1rem', color: '#666' }}>Arrastra las mesas para reubicarlas. Doble clic para editar.</p>
              <TableMap
                tables={tables}
                onTableClick={handleEditTable}
                onTableMove={handleTableMove}
              />
            </Card>
            <div className="admin-tables__sidebar">
              <ZoneConfigPanel
                zones={zoneCapacities}
                tables={tables}
                onUpdateCapacity={(zone, cap) => setZoneCapacities(prev => ({ ...prev, [zone]: cap }))}
              />
            </div>
          </div>
        )}

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
                  onClick={handleSaveTable}
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