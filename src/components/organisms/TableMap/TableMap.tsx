import React, { useState, useRef, useEffect } from 'react';
import { Table, TableStatus } from '@/types';
import './TableMap.scss';

interface TableMapProps {
    tables: Table[];
    onTableClick: (table: Table) => void;
    onTableMove?: (tableId: number, x: number, y: number) => void;
}

export const TableMap: React.FC<TableMapProps> = ({ tables, onTableClick, onTableMove }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [draggedTable, setDraggedTable] = useState<number | null>(null);
    const [localTables, setLocalTables] = useState<Table[]>(tables);

    useEffect(() => {
        // Initialize tables with default positions if they don't have them
        // This is a simulation based on the provided image layout
        const initializedTables = tables.map((table, index) => {
            if (table.x !== undefined && table.y !== undefined) return table;

            // Default positions logic based on location
            let x = 50;
            let y = 50;

            switch (table.ubicacion?.toLowerCase()) {
                case 'terraza':
                    x = 10 + (index % 5) * 15;
                    y = 15;
                    break;
                case 'interior':
                    x = 10 + (index % 4) * 20;
                    y = 50;
                    break;
                case 'vip':
                    x = 75 + (index % 2) * 15;
                    y = 45;
                    break;
                case 'privada':
                    x = 75 + (index % 2) * 15;
                    y = 70;
                    break;
                case 'bar':
                    x = 50;
                    y = 85;
                    break;
                default:
                    x = 10 + (index % 5) * 10;
                    y = 10 + Math.floor(index / 5) * 10;
            }

            return { ...table, x, y };
        });
        setLocalTables(initializedTables);
    }, [tables]);

    const handleMouseDown = (e: React.MouseEvent, tableId: number) => {
        e.stopPropagation();
        setDraggedTable(tableId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggedTable === null || !mapRef.current) return;

        const mapRect = mapRef.current.getBoundingClientRect();
        const x = ((e.clientX - mapRect.left) / mapRect.width) * 100;
        const y = ((e.clientY - mapRect.top) / mapRect.height) * 100;

        // Clamp values between 0 and 100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        setLocalTables(prev => prev.map(t =>
            t.id === draggedTable ? { ...t, x: clampedX, y: clampedY } : t
        ));
    };

    const handleMouseUp = () => {
        if (draggedTable !== null && onTableMove) {
            const table = localTables.find(t => t.id === draggedTable);
            if (table && table.x !== undefined && table.y !== undefined) {
                onTableMove(table.id, table.x, table.y);
            }
        }
        setDraggedTable(null);
    };

    const getStatusClass = (status: TableStatus | string) => {
        switch (status) {
            case TableStatus.OCUPADA:
            case 'ocupada': return 'table-map__table--occupied';
            case TableStatus.DISPONIBLE:
            case 'disponible': return 'table-map__table--available';
            case TableStatus.MANTENIMIENTO:
            case 'mantenimiento': return 'table-map__table--maintenance';
            default: return '';
        }
    };

    return (
        <div
            className="table-map"
            ref={mapRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Areas Background */}
            <div className="table-map__area table-map__area--terraza" style={{ top: '0%', left: '0%', width: '100%', height: '30%' }}>Terraza</div>
            <div className="table-map__area table-map__area--interior" style={{ top: '30%', left: '0%', width: '65%', height: '40%' }}>Interior</div>
            <div className="table-map__area table-map__area--vip" style={{ top: '30%', left: '65%', width: '35%', height: '25%' }}>VIP</div>
            <div className="table-map__area table-map__area--privada" style={{ top: '55%', left: '65%', width: '35%', height: '15%' }}>Sala Privada</div>
            <div className="table-map__area table-map__area--bar" style={{ top: '70%', left: '35%', width: '30%', height: '30%' }}>Bar</div>

            {/* Tables */}
            {localTables.map(table => (
                <div
                    key={table.id}
                    className={`table-map__table ${getStatusClass(table.estado)}`}
                    style={{
                        left: `${table.x}%`,
                        top: `${table.y}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, table.id)}
                    onDoubleClick={() => onTableClick(table)}
                    title={`Mesa ${table.numero_mesa} - ${table.capacidad} pers.`}
                >
                    <span className="table-map__table-number">{table.numero_mesa}</span>
                    <span className="table-map__table-capacity">{table.capacidad}p</span>
                </div>
            ))}
        </div>
    );
};
