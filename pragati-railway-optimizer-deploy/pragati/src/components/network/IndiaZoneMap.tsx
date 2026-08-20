import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { RailwayZone } from '../../types';
import { useRailway } from '../../context/RailwayContext';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  Radio, 
  Train, 
  Clock, 
  ShieldCheck,
  Eye
} from 'lucide-react';

interface IndiaZoneMapProps {
  onSelectZone?: (zone: RailwayZone) => void;
  selectedZoneCode?: string;
}

// Map Controller for smooth flyTo animations
const MapController: React.FC<{ selectedZone: RailwayZone | null }> = ({ selectedZone }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedZone && selectedZone.coordinates) {
      map.flyTo([selectedZone.coordinates.lat, selectedZone.coordinates.lng], 7, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedZone, map]);

  return null;
};

// Custom Leaflet DivIcon for Railway Zone HQ
const createZoneIcon = (zone: RailwayZone, isSelected: boolean, isHovered: boolean) => {
  const isSelectedOrHovered = isSelected || isHovered;
  
  const html = `
    <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${isSelectedOrHovered ? 'scale-125 z-50' : 'scale-100'}">
      <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg ${
        isSelected ? 'bg-[#FF6B00] ring-4 ring-orange-300' : 'bg-[#063B7A] border-2 border-white'
      }">
        <span class="text-[10px] font-black text-white font-mono tracking-tighter">${zone.code}</span>
      </div>
      <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full ${
        zone.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'
      } border border-white animate-pulse"></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-zone-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export const IndiaZoneMap: React.FC<IndiaZoneMapProps> = ({ onSelectZone, selectedZoneCode }) => {
  const { zones } = useRailway();
  const { user } = useAuth();
  const [hoveredZone, setHoveredZone] = useState<RailwayZone | null>(null);
  const [tileMode, setTileMode] = useState<'VOYAGER' | 'SATELLITE' | 'RAILWAY'>('VOYAGER');

  const activeSelectedZone = zones.find(z => z.code === selectedZoneCode) || null;

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-soft">
      
      {/* Header with Layer Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#FF6B00]" />
            <span>Zone Overview (Leaflet ISRO & IR GIS Map)</span>
          </h3>
          <p className="text-[11px] text-slate-400">Live operational status across all 17 railway zonal headquarters</p>
        </div>

        {/* Tile Layer Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTileMode('VOYAGER')}
            className={`px-2.5 py-1 rounded-lg transition ${
              tileMode === 'VOYAGER' ? 'bg-white text-[#063B7A] shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setTileMode('RAILWAY')}
            className={`px-2.5 py-1 rounded-lg transition ${
              tileMode === 'RAILWAY' ? 'bg-[#063B7A] text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tracks (OpenRailway)
          </button>
          <button
            onClick={() => setTileMode('SATELLITE')}
            className={`px-2.5 py-1 rounded-lg transition ${
              tileMode === 'SATELLITE' ? 'bg-[#FF6B00] text-white shadow-sm font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ISRO / Satellite
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        
        {/* Left: Interactive Leaflet Map of India with Zone Markers (6 Cols) */}
        <div className="lg:col-span-6 relative h-[360px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <MapContainer
            center={[22.5937, 78.9629]}
            zoom={4.5}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ background: '#E2E8F0' }}
          >
            {/* Dynamic Tile Layer */}
            {tileMode === 'VOYAGER' && (
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; Indian Railways'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                maxZoom={18}
              />
            )}
            {tileMode === 'RAILWAY' && (
              <>
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  maxZoom={18}
                />
                <TileLayer
                  attribution='&copy; <a href="https://www.openrailwaymap.org/">OpenRailwayMap</a>'
                  url="https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
              </>
            )}
            {tileMode === 'SATELLITE' && (
              <TileLayer
                attribution='&copy; ISRO Bhuvan / ESRI World Imagery'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={18}
              />
            )}

            <MapController selectedZone={activeSelectedZone} />

            {/* Zonal Markers */}
            {zones.map((zone) => {
              const isSelected = selectedZoneCode === zone.code;
              const isHovered = hoveredZone?.id === zone.id;

              return (
                <Marker
                  key={zone.id}
                  position={[zone.coordinates.lat, zone.coordinates.lng]}
                  icon={createZoneIcon(zone, isSelected, isHovered)}
                  eventHandlers={{
                    click: () => onSelectZone && onSelectZone(zone),
                    mouseover: () => setHoveredZone(zone),
                    mouseout: () => setHoveredZone(null)
                  }}
                >
                  <Popup>
                    <div className="p-3 bg-[#052B5F] text-white rounded-xl min-w-[200px] space-y-2">
                      <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                        <span className="font-mono font-black text-xs text-orange-400 bg-black/40 px-2 py-0.5 rounded">
                          {zone.code}
                        </span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                          {zone.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">{zone.name}</h4>
                        <p className="text-[10px] text-blue-200">HQ: {zone.headquarters}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                        <div className="bg-white/10 p-1.5 rounded">
                          <span className="text-[9px] text-slate-300 block">Trains</span>
                          <span className="font-bold">{zone.activeTrains}</span>
                        </div>
                        <div className="bg-white/10 p-1.5 rounded">
                          <span className="text-[9px] text-slate-300 block">Throughput</span>
                          <span className="font-bold text-orange-400">{zone.throughputPercentage}%</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectZone && onSelectZone(zone)}
                        className="w-full mt-2 py-1 bg-[#FF6B00] hover:bg-[#F45100] text-white text-[11px] font-bold rounded-lg transition"
                      >
                        Inspect Zone Dashboard →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Floating Map Overlay Badge */}
          <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 shadow-sm flex items-center space-x-1.5">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>17 GIS Zonal Hubs Online</span>
          </div>
        </div>

        {/* Right: Zone List Table (6 Cols) */}
        <div className="lg:col-span-6">
          <div className="max-h-[360px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <th className="pb-2 px-2">Zone</th>
                  <th className="pb-2 px-2 text-center">Trains</th>
                  <th className="pb-2 px-2 text-center">Throughput</th>
                  <th className="pb-2 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((zone) => {
                  const isHovered = hoveredZone?.id === zone.id;
                  const isSelected = selectedZoneCode === zone.code;

                  return (
                    <tr
                      key={zone.id}
                      onMouseEnter={() => setHoveredZone(zone)}
                      onMouseLeave={() => setHoveredZone(null)}
                      onClick={() => onSelectZone && onSelectZone(zone)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-orange-50 font-bold' :
                        isHovered ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="py-2.5 px-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-[#063B7A]">{zone.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({zone.code})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-slate-700">
                        {zone.activeTrains}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-emerald-600">
                        {zone.throughputPercentage}%
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {zone.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Hover preview tooltip */}
      {hoveredZone && (
        <div className="mt-3 bg-gradient-to-r from-[#063B7A] to-[#052B5F] text-white p-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <div>
            <span className="text-[10px] text-orange-300 font-mono font-bold uppercase">
              {hoveredZone.code} • Headquarters: {hoveredZone.headquarters}
            </span>
            <h4 className="text-sm font-bold">{hoveredZone.name}</h4>
          </div>
          <div className="flex items-center space-x-4 text-center">
            <div>
              <span className="text-[10px] text-slate-300 block">Active Trains</span>
              <span className="font-extrabold text-white">{hoveredZone.activeTrains}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 block">On-Time</span>
              <span className="font-extrabold text-emerald-400">{hoveredZone.onTimePercentage}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 block">Throughput</span>
              <span className="font-extrabold text-orange-400">{hoveredZone.throughputPercentage}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 block">Avg Delay</span>
              <span className="font-extrabold text-amber-300">{hoveredZone.averageDelayMinutes}m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
