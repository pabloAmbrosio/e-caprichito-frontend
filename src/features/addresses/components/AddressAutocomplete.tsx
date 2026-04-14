import { useState, useCallback, useRef } from 'react';
import { useLoadScript, GoogleMap, MarkerF, Autocomplete } from '@react-google-maps/api';

/* Stable reference — prevents useLoadScript from re-loading the script */
const LIBRARIES: ['places'] = ['places'];

const DEFAULT_CENTER = { lat: 18.972943, lng: -91.178980 }; // Sabancuy, Campeche
const MAP_ZOOM = 16;

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  gestureHandling: 'greedy',
};

export interface AddressAutocompleteValue {
  formattedAddress: string;
  details: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: AddressAutocompleteValue;
  onChange: (value: AddressAutocompleteValue) => void;
  idPrefix?: string;
}

export function AddressAutocomplete({ value, onChange, idPrefix = 'address' }: AddressAutocompleteProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
    libraries: LIBRARIES,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const hasCoords = value.lat !== 0 && value.lng !== 0;

  const onAutocompleteLoad = useCallback((ac: google.maps.places.Autocomplete) => {
    ac.setFields(['formatted_address', 'geometry']);
    autocompleteRef.current = ac;
  }, []);

  const onPlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    onChange({
      ...value,
      formattedAddress: place.formatted_address ?? '',
      lat,
      lng,
    });

    const pos = { lat, lng };
    setMapCenter(pos);
    mapRef.current?.panTo(pos);
  }, [value, onChange]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat == null || lng == null) return;

      onChange({ ...value, lat, lng });

      const geocoder = new google.maps.Geocoder();
      void geocoder.geocode({ location: { lat, lng } }).then(({ results }) => {
        if (results[0]) {
          onChange({
            ...value,
            formattedAddress: results[0].formatted_address,
            lat,
            lng,
          });
        }
      });
    },
    [value, onChange],
  );

  const inputClasses =
    'w-full pl-10 pr-4 py-3 rounded-xl border border-stroke bg-surface text-sm text-on-surface font-medium placeholder:text-on-surface-muted/40 transition-all duration-200 outline-none focus:ring-2 focus:ring-turquoise focus:border-turquoise';

  return (
    <div className="flex flex-col gap-3">
      {/* Address input */}
      <div>
        <label
          htmlFor={`${idPrefix}-address`}
          className="block text-xs font-bold text-on-surface-muted mb-1.5"
        >
          Dirección
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-4.5 h-4.5 text-on-surface-muted/40"
              aria-hidden="true"
            >
              <path
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>

          {isLoaded ? (
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
              options={{ componentRestrictions: { country: 'mx' } }}
            >
              <input
                id={`${idPrefix}-address`}
                type="text"
                value={value.formattedAddress}
                onChange={(e) =>
                  onChange({ ...value, formattedAddress: e.target.value })
                }
                placeholder="Busca tu dirección..."
                autoComplete="off"
                className={inputClasses}
              />
            </Autocomplete>
          ) : (
            <input
              id={`${idPrefix}-address`}
              type="text"
              value={value.formattedAddress}
              onChange={(e) =>
                onChange({ ...value, formattedAddress: e.target.value })
              }
              placeholder="Cargando mapa..."
              disabled
              className={inputClasses}
            />
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 ml-1">
          <svg viewBox="0 0 24 24" className="w-3 h-3" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-[0.6rem] text-on-surface-muted/40 font-medium">
            powered by Google
          </span>
        </div>
      </div>

      {/* Google Map */}
      {hasCoords && isLoaded && (
        <div className="rounded-xl border border-stroke overflow-hidden">
          <GoogleMap
            mapContainerClassName="h-48 w-full"
            center={mapCenter}
            zoom={MAP_ZOOM}
            onLoad={onMapLoad}
            options={MAP_OPTIONS}
          >
            <MarkerF
              position={{ lat: value.lat, lng: value.lng }}
              draggable
              onDragEnd={onMarkerDragEnd}
            />
          </GoogleMap>

          <div className="px-3 py-2 border-t border-stroke bg-surface flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-3.5 h-3.5 text-turquoise shrink-0"
              aria-hidden="true"
            >
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-[0.6875rem] text-on-surface-muted font-medium">
              Arrastra el pin si la ubicación no es exacta
            </span>
          </div>
        </div>
      )}

      {/* Details */}
      <div>
        <label
          htmlFor={`${idPrefix}-details`}
          className="block text-xs font-bold text-on-surface-muted mb-1.5"
        >
          Detalles adicionales{' '}
          <span className="font-medium text-on-surface-muted/50">(opcional)</span>
        </label>
        <textarea
          id={`${idPrefix}-details`}
          value={value.details}
          onChange={(e) => onChange({ ...value, details: e.target.value })}
          placeholder="Ej: Depto 3B, portón azul, entre calles Juárez y Morelos..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-stroke bg-surface text-sm text-on-surface font-medium placeholder:text-on-surface-muted/40 transition-all duration-200 outline-none focus:ring-2 focus:ring-turquoise focus:border-turquoise resize-none"
        />
      </div>
    </div>
  );
}
