import React from 'react';
import { Table } from '@/types';
import './ZoneConfigPanel.scss';

export interface ZoneConfig {
    [key: string]: number;
}

interface ZoneConfigPanelProps {
    zones: ZoneConfig;
    tables: Table[];
    onUpdateCapacity: (zone: string, capacity: number) => void;
}

export const ZoneConfigPanel: React.FC<ZoneConfigPanelProps> = ({ zones, tables, onUpdateCapacity }) => {

    const getZoneUsage = (zoneName: string) => {
        return tables.filter(t => t.ubicacion?.toLowerCase() === zoneName.toLowerCase()).length;
    };

    const getProgressColor = (current: number, max: number) => {
        const percentage = (current / max) * 100;
        if (percentage >= 100) return 'zone-config__progress-bar--full';
        if (percentage >= 80) return 'zone-config__progress-bar--warning';
        return '';
    };

    return (
        <div className="zone-config">
            <h3 className="zone-config__title">Capacidad por Zona</h3>
            <div className="zone-config__list">
                {Object.entries(zones).map(([zone, maxCapacity]) => {
                    const currentUsage = getZoneUsage(zone);
                    const percentage = Math.min((currentUsage / maxCapacity) * 100, 100);

                    return (
                        <div key={zone} className="zone-config__item">
                            <div className="zone-config__label">{zone}</div>
                            <div className="zone-config__input-group">
                                <input
                                    type="number"
                                    className="zone-config__input"
                                    value={maxCapacity}
                                    min={currentUsage} // Can't reduce below current usage
                                    onChange={(e) => onUpdateCapacity(zone, parseInt(e.target.value) || 0)}
                                />
                                <span className="zone-config__stats">
                                    {currentUsage} / {maxCapacity} mesas
                                </span>
                            </div>
                            <div className="zone-config__progress">
                                <div
                                    className={`zone-config__progress-bar ${getProgressColor(currentUsage, maxCapacity)}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
