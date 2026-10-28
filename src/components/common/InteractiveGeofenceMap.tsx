import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Navigation, ZoomIn, ZoomOut, Check, Layers, AlertCircle, Loader2 } from 'lucide-react';

interface InteractiveGeofenceMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationName?: string;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onAddressSelect?: (address: string, city: string) => void;
  interactive?: boolean;
  className?: string;
}

// Preset locations for fast selection in Niceso network
const NICESO_PRESETS = [
  {
    name: 'Niceso Head Office (Sudirman)',
    city: 'Jakarta Selatan',
    lat: -6.2297,
    lng: 106.8295,
    address: 'Jl. Jend. Sudirman Kav. 52-53, SCBD, Jakarta Selatan',
  },
  {
    name: 'Niceso Ciputat',
    city: 'Tangerang Selatan',
    lat: -6.3128,
    lng: 106.7490,
    address: 'Jl. Ir. H. Juanda No. 88, Ciputat, Tangerang Selatan',
  },
  {
    name: 'Niceso Grand Galaxy',
    city: 'Bekasi',
    lat: -6.2625,
    lng: 106.9740,
    address: 'Ruko Grand Galaxy City Blok RGA No. 12, Bekasi',
  },
  {
    name: 'Niceso Margonda',
    city: 'Depok',
    lat: -6.3725,
    lng: 106.8320,
    address: 'Jl. Margonda Raya No. 245, Pondok Cina, Depok',
  },
  {
    name: 'Niceso DC Marunda (Gudang)',
    city: 'Jakarta Utara',
    lat: -6.1105,
    lng: 106.9688,
    address: 'Kawasan Industri Marunda Center Blok B-08, Cilincing, Jakarta Utara',
  },
  {
    name: 'Niceso Bintaro Sektor 7',
    city: 'Tangerang Selatan',
    lat: -6.2842,
    lng: 106.7145,
    address: 'Jl. Boulevard Bintaro Jaya Sektor 7 Blok B7/D1, Tangerang Selatan',
  },
];

export const InteractiveGeofenceMap: React.FC<InteractiveGeofenceMapProps> = ({
  latitude,
  longitude,
  radiusMeters,
  locationName = 'Lokasi Kerja Niceso',
  onCoordinatesChange,
  onAddressSelect,
  interactive = true,
  className = 'h-72 w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ display_name: string; lat: string; lon: string; address?: any }>
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Custom styled HTML DivIcon for the map pin to avoid missing PNG asset issues
  const createCustomPinIcon = () => {
    return L.divIcon({
      className: 'niceso-custom-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="
            background: #e11d48;
            color: white;
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(225, 29, 72, 0.4);
            border: 2px solid #ffffff;
          ">
            <div style="
              transform: rotate(45deg);
              width: 10px;
              height: 10px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <div style="
            width: 12px;
            height: 4px;
            background: rgba(0, 0, 0, 0.25);
            border-radius: 50%;
            margin-top: 2px;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [34, 42],
      iconAnchor: [17, 40],
      popupAnchor: [0, -38],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already initialized
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const safeLat = isNaN(latitude) ? -6.2297 : latitude;
    const safeLng = isNaN(longitude) ? 106.8295 : longitude;

    const map = L.map(mapContainerRef.current, {
      center: [safeLat, safeLng],
      zoom: 16,
      zoomControl: false, // We'll add our own sleek controls
      attributionControl: false,
    });

    // Add high quality OpenStreetMap Tile Layer (no API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    // Add Geofence Circle
    const circle = L.circle([safeLat, safeLng], {
      radius: radiusMeters,
      color: '#e11d48',
      fillColor: '#f43f5e',
      fillOpacity: 0.18,
      weight: 2,
      dashArray: '6, 6',
    }).addTo(map);

    // Add Marker
    const marker = L.marker([safeLat, safeLng], {
      icon: createCustomPinIcon(),
      draggable: interactive,
      autoPan: true,
    }).addTo(map);

    // Marker drag event
    if (interactive) {
      marker.on('drag', (e: any) => {
        const newPos = e.target.getLatLng();
        circle.setLatLng(newPos);
      });

      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        circle.setLatLng(newPos);
        onCoordinatesChange(Number(newPos.lat.toFixed(6)), Number(newPos.lng.toFixed(6)));
      });

      // Map click event
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        onCoordinatesChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)));
      });
    }

    mapInstanceRef.current = map;
    markerRef.current = marker;
    circleRef.current = circle;

    // Fix map rendering issues inside tab/modal transitions
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run once on mount

  // React to prop changes (radius, lat, lng)
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !circleRef.current) return;

    const safeLat = isNaN(latitude) ? -6.2297 : latitude;
    const safeLng = isNaN(longitude) ? 106.8295 : longitude;

    // Update Circle Radius directly in real-time
    circleRef.current.setRadius(radiusMeters);

    // Update positions if changed from external slider / input
    const curPos = markerRef.current.getLatLng();
    if (Math.abs(curPos.lat - safeLat) > 0.00001 || Math.abs(curPos.lng - safeLng) > 0.00001) {
      markerRef.current.setLatLng([safeLat, safeLng]);
      circleRef.current.setLatLng([safeLat, safeLng]);
      mapInstanceRef.current.panTo([safeLat, safeLng], { animate: true });
    }
  }, [latitude, longitude, radiusMeters]);

  // Handler for address search with OpenStreetMap Nominatim
  const handleSearchSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setShowResults(true);

    try {
      // Free public OpenStreetMap Nominatim API for Indonesia geocoding
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=id&q=${encodeURIComponent(
        searchQuery
      )}`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'id,en',
        },
      });

      if (!res.ok) throw new Error('Gagal menghubungi server pencarian peta.');
      const data = await res.json();

      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
        setSearchError('Lokasi tidak ditemukan. Coba gunakan nama jalan atau kota yang lebih spesifik.');
      }
    } catch (err: any) {
      // Filter presets locally as fallback
      const matchingPresets = NICESO_PRESETS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchingPresets.length > 0) {
        setSearchResults(
          matchingPresets.map((p) => ({
            display_name: `${p.name} - ${p.address}`,
            lat: String(p.lat),
            lon: String(p.lng),
            address: { city: p.city },
          }))
        );
      } else {
        setSearchError('Koneksi pencarian alamat gagal. Anda dapat memilih dari daftar Preset Lokasi Niceso.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (latStr: string, lonStr: string, displayName: string) => {
    const newLat = Number(parseFloat(latStr).toFixed(6));
    const newLng = Number(parseFloat(lonStr).toFixed(6));

    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      circleRef.current.setLatLng([newLat, newLng]);
      mapInstanceRef.current.setView([newLat, newLng], 17, { animate: true });
    }

    onCoordinatesChange(newLat, newLng);

    if (onAddressSelect) {
      // Split display name for readable address and city
      const parts = displayName.split(',').map((s) => s.trim());
      const city = parts.find((p) => /jakarta|tangerang|bekasi|depok|bogor|bandung|surabaya/i.test(p)) || parts[1] || 'Indonesia';
      onAddressSelect(displayName, city);
    }

    setShowResults(false);
  };

  const handleSelectPreset = (preset: (typeof NICESO_PRESETS)[0]) => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      markerRef.current.setLatLng([preset.lat, preset.lng]);
      circleRef.current.setLatLng([preset.lat, preset.lng]);
      mapInstanceRef.current.setView([preset.lat, preset.lng], 17, { animate: true });
    }
    onCoordinatesChange(preset.lat, preset.lng);
    if (onAddressSelect) {
      onAddressSelect(preset.address, preset.city);
    }
    setShowResults(false);
  };

  const handleZoom = (delta: number) => {
    if (mapInstanceRef.current) {
      const curZoom = mapInstanceRef.current.getZoom();
      mapInstanceRef.current.setZoom(curZoom + delta);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latitude, longitude], 17, { animate: true });
    }
  };

  return (
    <div className="relative flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-white">
      {/* Search Header Bar (if interactive) */}
      {interactive && (
        <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
          <div className="relative flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
                placeholder="Cari alamat, jalan, atau nama cabang Niceso..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-rose-600 focus:ring-1 focus:ring-rose-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              onClick={() => handleSearchSubmit()}
              disabled={isSearching}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50 shrink-0"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Cari'}
            </button>
          </div>

          {/* Quick Presets Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-600 scrollbar-none">
            <span className="font-semibold text-slate-400 shrink-0 text-[10px] uppercase">
              Preset:
            </span>
            {NICESO_PRESETS.slice(0, 4).map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2 py-0.5 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-700 whitespace-nowrap transition-colors shrink-0 font-medium"
              >
                {p.name.replace('Niceso ', '')}
              </button>
            ))}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-14 left-2 right-2 z-50 bg-white rounded-lg shadow-xl border border-slate-200 max-h-56 overflow-y-auto divide-y divide-slate-100">
              <div className="p-2 bg-slate-50 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>Hasil Pencarian Lokasi ({searchResults.length})</span>
                <button
                  type="button"
                  onClick={() => setShowResults(false)}
                  className="text-rose-600 hover:underline text-[10px]"
                >
                  Tutup
                </button>
              </div>

              {searchError && (
                <div className="p-3 text-xs text-amber-700 bg-amber-50 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{searchError}</span>
                </div>
              )}

              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(item.lat, item.lon, item.display_name)}
                  className="w-full text-left p-2.5 hover:bg-rose-50/60 transition-colors flex items-start gap-2 text-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 truncate">
                    <p className="font-medium text-slate-800 truncate">{item.display_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Lat: {Number(item.lat).toFixed(4)}, Lng: {Number(item.lon).toFixed(4)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Map Canvas Container */}
      <div className="relative">
        <div ref={mapContainerRef} className={className} style={{ minHeight: '260px' }} />

        {/* Floating Controls Overlay */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 shadow-md rounded-lg overflow-hidden border border-slate-200">
          <button
            type="button"
            onClick={() => handleZoom(1)}
            aria-label="Perbesar Peta"
            className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors border-b border-slate-100"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(-1)}
            aria-label="Perkecil Peta"
            className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors border-b border-slate-100"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            aria-label="Kembali ke Titik Pusat"
            title="Pusatkan ke Pin Lokasi"
            className="w-7 h-7 bg-white hover:bg-slate-100 text-rose-600 flex items-center justify-center transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Radius & Coordinates HUD Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <span className="font-bold text-slate-800">Radius: {radiusMeters} m</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              (Luas ~{Math.round(Math.PI * radiusMeters * radiusMeters).toLocaleString('id-ID')} m²)
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-600">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </div>
        </div>

        {/* Tip Indicator */}
        {interactive && (
          <div className="absolute top-3 left-3 z-30 bg-black/65 text-white text-[10px] px-2 py-0.5 rounded-md pointer-events-none">
            Klik peta atau geser pin untuk atur titik
          </div>
        )}
      </div>
    </div>
  );
};
