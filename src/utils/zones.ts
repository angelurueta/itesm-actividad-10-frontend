export const ZONES = {
    TERRAZA: { name: 'Terraza', x: 0, y: 0, width: 100, height: 30 },
    INTERIOR: { name: 'Interior', x: 0, y: 30, width: 65, height: 40 },
    VIP: { name: 'VIP', x: 65, y: 30, width: 35, height: 25 },
    PRIVADA: { name: 'Sala Privada', x: 65, y: 55, width: 35, height: 15 },
    BAR: { name: 'Bar', x: 35, y: 70, width: 30, height: 30 },
};

export const getZoneFromCoordinates = (x: number, y: number) => {
    for (const key in ZONES) {
        const zone = ZONES[key as keyof typeof ZONES];
        if (x >= zone.x && x <= zone.x + zone.width && y >= zone.y && y <= zone.y + zone.height) {
            return zone.name;
        }
    }
    return 'Desconocida';
};
