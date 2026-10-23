import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getAllProperties, type LoadedProperty } from '@/map';
import { Reveal, SectionHeading } from '@/components/site';
import { useCurrency } from '@/lib/currency';
import {
  MapPin,
  Home,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ExternalLink,
  X,
  Globe2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Strict geographical boundaries of Japan
const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [122.0, 24.0],
  [149.0, 46.0],
];
const JAPAN_CENTER: [number, number] = [138.2, 36.2];

const CARTO_KEY = 'cb1_4rxn_1_9a171f28972b45bbfce4643e';

type MapTheme = 'voyager' | 'dark' | 'satellite';

const MAP_STYLES: Record<MapTheme, maplibregl.StyleSpecification> = {
  voyager: {
    version: 8,
    name: 'CARTO Voyager Japan',
    sources: {
      'carto-voyager': {
        type: 'raster',
        tiles: [
          `https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
          `https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
          `https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
          `https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors, © CARTO',
      },
    },
    layers: [
      { id: 'carto-voyager-layer', type: 'raster', source: 'carto-voyager', minzoom: 0, maxzoom: 20 },
    ],
  },
  dark: {
    version: 8,
    name: 'CARTO Dark Matter Japan',
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: [
          `https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
          `https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
          `https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
          `https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${CARTO_KEY}`,
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors, © CARTO',
      },
    },
    layers: [
      { id: 'carto-dark-layer', type: 'raster', source: 'carto-dark', minzoom: 0, maxzoom: 20 },
    ],
  },
  satellite: {
    version: 8,
    name: 'Japan Satellite Imagery',
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '© Esri, Maxar, Earthstar Geographics',
      },
    },
    layers: [
      { id: 'esri-satellite-layer', type: 'raster', source: 'esri-satellite', minzoom: 0, maxzoom: 20 },
    ],
  },
};

/* ── Mobile full-screen property sheet ───────────────────────────────── */
function MobilePropertySheet({
  prop,
  allProps,
  onClose,
  onNavigate,
}: {
  prop: LoadedProperty;
  allProps: LoadedProperty[];
  onClose: () => void;
  onNavigate: (prop: LoadedProperty) => void;
}) {
  const { formatEur } = useCurrency();
  const [imgIdx, setImgIdx] = useState(0);
  const currentIdx = allProps.findIndex((p) => p.id === prop.id);

  // Reset image index when prop changes
  useEffect(() => { setImgIdx(0); }, [prop.id]);

  // Lock body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const imgs = prop.imageUrls.length > 0 ? prop.imageUrls : [prop.imageUrl].filter(Boolean) as string[];

  const prevImg = () => setImgIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const nextImg = () => setImgIdx((i) => (i + 1) % imgs.length);

  const prevProp = () => {
    const idx = (currentIdx - 1 + allProps.length) % allProps.length;
    onNavigate(allProps[idx]!);
  };
  const nextProp = () => {
    const idx = (currentIdx + 1) % allProps.length;
    onNavigate(allProps[idx]!);
  };

  const priceDisplay = prop.priceEurAmount > 0 ? formatEur(prop.priceEurAmount) : prop.price;

  return (
    <div className="fixed inset-0 z-[9990] bg-background flex flex-col">
      {/* Close bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-card shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Back to Map
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={prevProp}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-background transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-[11px] text-muted-foreground">
            {currentIdx + 1} / {allProps.length}
          </span>
          <button
            onClick={nextProp}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-background transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image carousel — takes top portion */}
      <div className="relative bg-black flex-none" style={{ height: '55vw', maxHeight: '52vh' }}>
        {imgs.length > 0 && (
          <img
            src={imgs[imgIdx]}
            alt={prop.title}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />

        {imgs.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white border border-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white border border-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    imgIdx === i ? 'w-5 bg-gold' : 'w-1.5 bg-white/50'
                  )}
                />
              ))}
            </div>
            <div className="absolute top-3 right-3 rounded bg-black/70 px-2 py-0.5 text-[10px] text-white/80 font-mono border border-white/20">
              {imgIdx + 1} / {imgs.length}
            </div>
          </>
        )}

        {/* Price overlay */}
        <div className="absolute bottom-3 left-4">
          <span className="font-display text-2xl font-bold text-white drop-shadow">{priceDisplay}</span>
        </div>
      </div>

      {/* Details — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">{prop.title}</h2>
          {prop.japaneseTitle && (
            <p className="font-jp text-sm text-gold/80 mt-1">{prop.japaneseTitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-gold shrink-0" />
          <span>{prop.location}</span>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-3 border-y border-border/40 py-4 text-xs">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Type</span>
            <span className="font-semibold text-foreground">{prop.type || 'House'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Land / Floor</span>
            <span className="font-semibold text-foreground">{prop.landArea || 'N/A'} / {prop.floorArea || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Built</span>
            <span className="font-semibold text-gold font-mono">{prop.yearBuilt || '2026'}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{prop.description}</p>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2 pb-6">
          <a
            href="/book"
            className="w-full text-center rounded border border-gold bg-gold/15 py-3 text-sm font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-background transition-all"
          >
            Inquire About This House
          </a>
          <a
            href="https://maps.app.goo.gl/9aRGHRgbNwCPK5rd7?g_st=iw"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 rounded border border-border/60 bg-background py-3 text-sm text-muted-foreground hover:text-gold hover:border-gold transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Main map component ───────────────────────────────────────────────── */
export function JapanPropertyMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: maplibregl.Marker }>({});
  const activePopupRef = useRef<maplibregl.Popup | null>(null);
  const { formatEur } = useCurrency();

  const [properties, setProperties] = useState<LoadedProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<LoadedProperty | null>(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<MapTheme>('voyager');

  // Mobile full-screen sheet state
  const [mobileSheet, setMobileSheet] = useState<LoadedProperty | null>(null);
  const isMobile = () => window.innerWidth < 1024;

  // Load properties
  useEffect(() => {
    const loaded = getAllProperties();
    setProperties(loaded);
    if (loaded.length > 0) {
      setSelectedProperty(loaded[0]!);
    }
  }, []);

  // Helper: get price label using currency converter
  const getPriceLabel = useCallback((prop: LoadedProperty): string => {
    if (prop.priceEurAmount > 0) return formatEur(prop.priceEurAmount);
    return prop.price;
  }, [formatEur]);

  // Render markers
  const renderMarkers = useCallback((map: maplibregl.Map, propsList: LoadedProperty[]) => {
    if (!map || propsList.length === 0) return;

    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    propsList.forEach((prop) => {
      const isFeatured = prop.id === 'yamanashi-modern-renewal';
      const hasMultipleImages = prop.imageUrls && prop.imageUrls.length > 1;
      const priceLabel = prop.priceEurAmount > 0 ? formatEur(prop.priceEurAmount) : prop.price;

      // Custom HTML marker
      const el = document.createElement('div');
      el.className = 'property-marker-wrapper group cursor-pointer select-none';
      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <div class="mb-1.5 flex items-center gap-1.5 rounded-full border ${isFeatured ? 'border-amber-500 bg-amber-500 text-black shadow-xl scale-105 ring-2 ring-amber-400/50' : 'border-gold/70 bg-background/95 text-gold'} px-3 py-1 text-[11px] font-bold shadow-lg backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-background">
            <span class="inline-block h-2 w-2 rounded-full ${isFeatured ? 'bg-black' : 'bg-gold'} group-hover:bg-background animate-pulse"></span>
            <span>${priceLabel}</span>
            ${hasMultipleImages ? `<span class="opacity-80 text-[9px]">(${prop.imageUrls.length}📷)</span>` : ''}
          </div>
          <div class="relative flex h-8 w-8 items-center justify-center rounded-full border border-gold ${isFeatured ? 'bg-amber-500 text-black ring-4 ring-amber-400/30' : 'bg-card text-gold'} shadow-elegant transition-transform duration-300 group-hover:scale-125">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            <div class="absolute -inset-1.5 rounded-full border border-gold/40 animate-ping opacity-60"></div>
          </div>
        </div>
      `;

      // Popup HTML
      const initialImage = prop.imageUrls[0] || prop.imageUrl || '/favicon.png';
      const popupHtml = `
        <div class="kakehashi-popup-card overflow-hidden rounded-lg bg-card/95 text-foreground" data-property-id="${prop.id}">
          <div class="relative h-48 w-full overflow-hidden bg-background group/slider">
            <img id="popup-img-${prop.id}" src="${initialImage}" alt="${prop.title}" class="h-full w-full object-cover transition-opacity duration-300"/>
            <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none"></div>
            <div class="absolute top-3 left-3 flex items-center gap-1.5">
              <span class="rounded bg-background/85 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold backdrop-blur border border-gold/30">${prop.status || 'Verified Property'}</span>
              ${hasMultipleImages ? `<span id="popup-counter-${prop.id}" class="rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-white/90 backdrop-blur">1 / ${prop.imageUrls.length}</span>` : ''}
            </div>
            ${hasMultipleImages ? `
              <div class="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-auto">
                <button id="popup-prev-${prop.id}" class="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-gold hover:text-black transition-all border border-white/20 text-sm font-bold">‹</button>
                <button id="popup-next-${prop.id}" class="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-gold hover:text-black transition-all border border-white/20 text-sm font-bold">›</button>
              </div>` : ''}
            <div class="absolute bottom-3 left-3 right-3 flex items-baseline justify-between pointer-events-none">
              <span class="font-display text-2xl font-bold text-white drop-shadow">${priceLabel}</span>
            </div>
          </div>
          <div class="p-4 space-y-3">
            <div>
              <h4 class="font-display text-lg leading-tight text-white">${prop.title}</h4>
              ${prop.japaneseTitle ? `<p class="font-jp text-xs text-gold/80 mt-0.5">${prop.japaneseTitle}</p>` : ''}
            </div>
            <div class="flex items-center gap-1.5 text-xs text-muted-foreground">
              <svg class="h-3.5 w-3.5 text-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span>${prop.location}</span>
            </div>
            <div class="grid grid-cols-3 gap-2 border-y border-border/40 py-2 text-[11px]">
              <div><span class="text-muted-foreground block text-[9px] uppercase tracking-wider">Type</span><span class="font-medium text-foreground">${prop.type || 'House'}</span></div>
              <div><span class="text-muted-foreground block text-[9px] uppercase tracking-wider">Land / Floor</span><span class="font-medium text-foreground">${prop.landArea || 'N/A'} / ${prop.floorArea || 'N/A'}</span></div>
              <div><span class="text-muted-foreground block text-[9px] uppercase tracking-wider">Year</span><span class="font-medium text-gold font-mono">${prop.yearBuilt || '2026'}</span></div>
            </div>
            <p class="text-xs text-muted-foreground leading-relaxed">${prop.description}</p>
            <div class="pt-1 flex gap-2">
              <a href="/book" class="flex-1 text-center rounded border border-gold/70 bg-gold/15 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-background transition-colors duration-300">Inquire About House</a>
              <a href="https://maps.app.goo.gl/9aRGHRgbNwCPK5rd7?g_st=iw" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center rounded border border-border/60 bg-background/80 px-2.5 text-xs text-muted-foreground hover:text-gold hover:border-gold transition-colors" title="Open in Google Maps">
                <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 28,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '360px',
        className: 'kakehashi-map-popup',
      }).setHTML(popupHtml);

      // Attach image slider events
      popup.on('open', () => {
        if (!hasMultipleImages) return;
        const imgElem = document.getElementById(`popup-img-${prop.id}`) as HTMLImageElement | null;
        const counterElem = document.getElementById(`popup-counter-${prop.id}`);
        const prevBtn = document.getElementById(`popup-prev-${prop.id}`);
        const nextBtn = document.getElementById(`popup-next-${prop.id}`);
        let currIdx = 0;
        const showIndex = (idx: number) => {
          currIdx = (idx + prop.imageUrls.length) % prop.imageUrls.length;
          if (imgElem) imgElem.src = prop.imageUrls[currIdx]!;
          if (counterElem) counterElem.textContent = `${currIdx + 1} / ${prop.imageUrls.length}`;
        };
        prevBtn?.addEventListener('click', (e) => { e.stopPropagation(); showIndex(currIdx - 1); });
        nextBtn?.addEventListener('click', (e) => { e.stopPropagation(); showIndex(currIdx + 1); });
      });

      // Marker click — zoom in + show popup, or open mobile sheet
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMobile()) {
          setMobileSheet(prop);
        } else {
          handleSelectProperty(prop, popup);
        }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(prop.coordinates)
        .setPopup(popup)
        .addTo(map);

      markersRef.current[prop.id] = marker;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formatEur]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES.voyager,
      center: JAPAN_CENTER,
      zoom: 5.5,
      minZoom: 4.5,
      maxZoom: 18,
      maxBounds: JAPAN_BOUNDS,
      renderWorldCopies: false,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

    map.on('load', () => {
      mapRef.current = map;
      map.resize();
      if (properties.length > 0) renderMarkers(map, properties);
    });

    map.on('style.load', () => {
      if (properties.length > 0) renderMarkers(map, properties);
    });

    const t = setTimeout(() => map.resize(), 250);

    return () => {
      clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, [properties, renderMarkers]);

  // Re-render markers when currency changes (prices need refresh)
  useEffect(() => {
    const map = mapRef.current;
    if (map && properties.length > 0) renderMarkers(map, properties);
  }, [properties, renderMarkers]);

  const handleThemeChange = (theme: MapTheme) => {
    const map = mapRef.current;
    if (!map) return;
    setCurrentTheme(theme);
    map.setStyle(MAP_STYLES[theme]);
  };

  const handleSelectProperty = (prop: LoadedProperty, existingPopup?: maplibregl.Popup) => {
    const map = mapRef.current;
    if (!map) return;

    setSelectedProperty(prop);
    setSelectedImgIndex(0);

    if (activePopupRef.current?.isOpen()) activePopupRef.current.remove();

    map.flyTo({
      center: prop.coordinates,
      zoom: 13,
      speed: 1.2,
      curve: 1.4,
      essential: true,
      offset: [0, -70],
    });

    const marker = markersRef.current[prop.id];
    if (marker) {
      const popup = existingPopup || marker.getPopup();
      if (popup) {
        popup.addTo(map);
        activePopupRef.current = popup;
      }
    }
  };

  const handleResetView = () => {
    const map = mapRef.current;
    if (!map) return;
    if (activePopupRef.current?.isOpen()) activePopupRef.current.remove();
    map.fitBounds(JAPAN_BOUNDS, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 6,
      duration: 1500,
    });
  };

  // House-to-house navigation
  const navigateProperty = (direction: 'prev' | 'next') => {
    if (properties.length === 0) return;
    const currentIdx = properties.findIndex((p) => p.id === selectedProperty?.id);
    const nextIdx =
      direction === 'next'
        ? (currentIdx + 1) % properties.length
        : (currentIdx - 1 + properties.length) % properties.length;
    const nextProp = properties[nextIdx]!;
    if (isMobile()) {
      setMobileSheet(nextProp);
    } else {
      handleSelectProperty(nextProp);
    }
    setSelectedProperty(nextProp);
  };

  const nextImage = () => {
    if (!selectedProperty?.imageUrls?.length) return;
    setSelectedImgIndex((prev) => (prev + 1) % selectedProperty.imageUrls.length);
  };
  const prevImage = () => {
    if (!selectedProperty?.imageUrls?.length) return;
    setSelectedImgIndex((prev) => (prev - 1 + selectedProperty.imageUrls.length) % selectedProperty.imageUrls.length);
  };

  const selectedPriceLabel = selectedProperty
    ? selectedProperty.priceEurAmount > 0
      ? formatEur(selectedProperty.priceEurAmount)
      : selectedProperty.price
    : '';

  const currentPropIdx = properties.findIndex((p) => p.id === selectedProperty?.id);

  return (
    <>
      {/* Mobile full-screen sheet */}
      {mobileSheet && (
        <MobilePropertySheet
          prop={mobileSheet}
          allProps={properties}
          onClose={() => {
            setMobileSheet(null);
            // Auto-reset map to full Japan view on close
            const map = mapRef.current;
            if (map) {
              if (activePopupRef.current?.isOpen()) activePopupRef.current.remove();
              map.fitBounds(JAPAN_BOUNDS, {
                padding: { top: 60, bottom: 60, left: 60, right: 60 },
                maxZoom: 6,
                duration: 1200,
              });
            }
          }}
          onNavigate={(prop) => {
            setMobileSheet(prop);
            setSelectedProperty(prop);
          }}
        />
      )}

      <section className="relative px-6 py-28 border-t border-border/40">
        <div className="mx-auto max-w-7xl">
          {/* Section Heading */}
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <SectionHeading
                eyebrow="Interactive Regional Discovery"
                title="Explore Properties Across Japan"
              />
              <div className="flex flex-wrap items-center gap-3">
                {/* Map Style Switcher */}
                <div className="flex items-center rounded-full border border-gold/40 bg-background/90 p-1 backdrop-blur shadow-sm">
                  {(['voyager', 'dark', 'satellite'] as MapTheme[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => handleThemeChange(theme)}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs transition-all capitalize',
                        currentTheme === theme ? 'bg-gold text-background font-semibold shadow' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {theme === 'voyager' ? 'Voyager' : theme === 'dark' ? 'Dark Cedar' : 'Satellite'}
                    </button>
                  ))}
                </div>

                {/* House Nav Buttons */}
                <div className="flex items-center gap-1 rounded-full border border-gold/40 bg-background/90 p-1 backdrop-blur shadow-sm">
                  <button
                    onClick={() => navigateProperty('prev')}
                    disabled={properties.length === 0}
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-gold hover:bg-gold hover:text-background transition-all disabled:opacity-40"
                    title="Previous House"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </button>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {properties.length > 0 ? `${currentPropIdx + 1}/${properties.length}` : '—'}
                  </span>
                  <button
                    onClick={() => navigateProperty('next')}
                    disabled={properties.length === 0}
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs text-gold hover:bg-gold hover:text-background transition-all disabled:opacity-40"
                    title="Next House"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Reset to All Japan */}
                <button
                  onClick={handleResetView}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-background/80 px-4 py-2 text-xs uppercase tracking-wider text-gold backdrop-blur hover:bg-gold hover:text-background transition-all"
                >
                  <Globe2 className="h-3.5 w-3.5" />
                  <span>All Japan</span>
                </button>
              </div>
            </div>
          </Reveal>

          {/* Map & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Map viewport */}
            <div className="lg:col-span-8 overflow-hidden rounded-xl border border-gold/40 bg-card shadow-elegant relative">
              {/* Japan badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-gold/40 bg-background/90 px-3 py-1.5 text-[11px] font-medium text-gold backdrop-blur shadow-md pointer-events-none">
                <span className="h-2 w-2 rounded-full bg-gold-bright animate-ping" />
                <span>Bound to Japan Territory</span>
              </div>

              {/* Floating overlay nav (desktop) — Reset + Prev/Next on the map itself */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 hidden sm:flex items-center gap-2">
                <button
                  onClick={() => navigateProperty('prev')}
                  disabled={properties.length === 0}
                  className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-background/90 px-3 py-1.5 text-xs text-gold backdrop-blur hover:bg-gold hover:text-background transition-all shadow-md disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev House
                </button>
                <button
                  onClick={handleResetView}
                  className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-background/90 px-4 py-1.5 text-xs text-gold backdrop-blur hover:bg-gold hover:text-background transition-all shadow-md"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset View
                </button>
                <button
                  onClick={() => navigateProperty('next')}
                  disabled={properties.length === 0}
                  className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-background/90 px-3 py-1.5 text-xs text-gold backdrop-blur hover:bg-gold hover:text-background transition-all shadow-md disabled:opacity-40"
                >
                  Next House
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Quick stats */}
              <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-4 rounded-lg border border-border/60 bg-background/90 px-4 py-2.5 text-xs backdrop-blur shadow-md text-muted-foreground pointer-events-none">
                <div className="flex items-center gap-1.5">
                  <Home className="h-3.5 w-3.5 text-gold" />
                  <span className="text-foreground font-semibold">{properties.length}</span>
                  Listed Properties
                </div>
                <span className="text-border">|</span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gold" />
                  <span>Click markers to inspect</span>
                </div>
              </div>

              <div ref={mapContainerRef} className="h-[520px] sm:h-[620px] w-full" />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                  Available Portfolio ({properties.length})
                </span>
                <span className="text-[11px] text-muted-foreground">Auto-synced from /src/map/</span>
              </div>

              {/* Active property spotlight */}
              {selectedProperty && (
                <div className="rounded-xl border border-gold/70 bg-card/90 p-4 shadow-elegant ring-1 ring-gold/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-gold font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" />
                      Active House Spotlight
                    </span>
                    <span className="text-xs font-mono font-bold text-white bg-gold/20 px-2 py-0.5 rounded border border-gold/40">
                      {selectedPriceLabel}
                    </span>
                  </div>

                  {/* Image viewer */}
                  <div className="relative h-48 w-full rounded-lg overflow-hidden bg-background mb-3 group">
                    <img
                      src={selectedProperty.imageUrls[selectedImgIndex] || selectedProperty.imageUrl}
                      alt={selectedProperty.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />

                    {selectedProperty.imageUrls.length > 1 && (
                      <>
                        <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-mono text-white/90 backdrop-blur border border-white/20">
                          Photo {selectedImgIndex + 1} of {selectedProperty.imageUrls.length}
                          {selectedProperty.id === 'yamanashi-modern-renewal' && (
                            <span className="ml-1 text-gold">
                              {selectedImgIndex === 0 ? '· Modern Renewal' : selectedImgIndex === 1 ? '· Cleared Site' : '· Original Akiya'}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); prevImage(); }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-gold hover:text-black transition-all border border-white/20"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); nextImage(); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-gold hover:text-black transition-all border border-white/20"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {selectedProperty.imageUrls.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedImgIndex(i)}
                              className={cn(
                                'h-1.5 rounded-full transition-all',
                                selectedImgIndex === i ? 'w-4 bg-gold' : 'w-1.5 bg-white/50'
                              )}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Specs */}
                  <h4 className="font-display text-lg font-bold text-white">{selectedProperty.title}</h4>
                  {selectedProperty.japaneseTitle && (
                    <p className="font-jp text-xs text-gold/80 mb-2">{selectedProperty.japaneseTitle}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span>{selectedProperty.location}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-y border-border/40 py-2 text-[11px] mb-3">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Type</span>
                      <span className="font-medium text-foreground">{selectedProperty.type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Land / Floor</span>
                      <span className="font-medium text-foreground">{selectedProperty.landArea} / {selectedProperty.floorArea}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Built</span>
                      <span className="font-medium text-gold font-mono">{selectedProperty.yearBuilt}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{selectedProperty.description}</p>

                  {/* Property nav */}
                  <div className="flex gap-1.5 mb-3">
                    <button
                      onClick={() => navigateProperty('prev')}
                      className="flex-1 flex items-center justify-center gap-1 rounded border border-border/60 bg-background/80 py-1.5 text-xs text-muted-foreground hover:text-gold hover:border-gold transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Prev
                    </button>
                    <button
                      onClick={() => navigateProperty('next')}
                      className="flex-1 flex items-center justify-center gap-1 rounded border border-border/60 bg-background/80 py-1.5 text-xs text-muted-foreground hover:text-gold hover:border-gold transition-colors"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="/book"
                      className="flex-1 text-center rounded border border-gold bg-gold/15 py-2 text-xs font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-background transition-all"
                    >
                      Inquire For This House
                    </a>
                    <a
                      href="https://maps.app.goo.gl/9aRGHRgbNwCPK5rd7?g_st=iw"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded border border-border/60 bg-background/80 px-3 py-2 text-xs text-muted-foreground hover:text-gold hover:border-gold transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Maps
                    </a>
                  </div>
                </div>
              )}

              {/* Properties list */}
              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {properties.map((prop) => {
                  const isSelected = selectedProperty?.id === prop.id;
                  const listPriceLabel = prop.priceEurAmount > 0 ? formatEur(prop.priceEurAmount) : prop.price;
                  return (
                    <div
                      key={prop.id}
                      onClick={() => handleSelectProperty(prop)}
                      className={cn(
                        'group cursor-pointer rounded-lg border p-3 transition-all duration-300 bg-background/60 hover:bg-card hover:border-gold/60',
                        isSelected ? 'border-gold bg-card shadow-elegant ring-1 ring-gold/50' : 'border-border/60'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-background border border-border/40">
                          <img
                            src={prop.imageUrls[0] || prop.imageUrl || '/favicon.png'}
                            alt={prop.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-display text-sm font-semibold text-foreground truncate block">{prop.title}</span>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                            <MapPin className="h-3 w-3 text-gold shrink-0" />
                            <span className="truncate">{prop.location}</span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between">
                            <span className="font-display text-sm font-bold text-gold">{listPriceLabel}</span>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-0.5 group-hover:text-gold transition-colors">
                              Locate <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
