import React, { useState, useEffect, useRef } from 'react';
import addressService from '../services/addressService';

const AddressSearch = () => {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Refs for managing focus and suggestions
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Autocomplete debouncing
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (address.length > 2) {
      debounceRef.current = setTimeout(() => {
        fetchAutocomplete(address);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [address]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAutocomplete = async (query) => {
    try {
      console.log(`🔍 Fetching autocomplete for: ${query}`);
      const response = await addressService.autocomplete(query);
      
      if (response.success && response.suggestions) {
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleGeocode = async (addressToGeocode) => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log(`📍 Geocoding address: ${addressToGeocode}`);
      const response = await addressService.geocode(addressToGeocode);

      if (response.success) {
        setResults(response);
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        setError(response.error || 'Geocoding failed');
      }
      
    } catch (error) {
      setError('Network error occurred while geocoding');
      console.error('Geocoding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const selectedAddress = suggestion.address || suggestion.title;
    setAddress(selectedAddress);
    setSuggestions([]);
    setShowSuggestions(false);
    handleGeocode(selectedAddress);
  };

  const handleInputChange = (e) => {
    setAddress(e.target.value);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      handleGeocode(address.trim());
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#22c55e'; // Green
    if (confidence >= 0.6) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'Nagy pontosság';
    if (confidence >= 0.6) return 'Közepes pontosság';
    return 'Alacsony pontosság';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '2.5em', 
          color: '#2563eb', 
          marginBottom: '10px',
          fontWeight: 'bold'
        }}>
          🏢 Budapest V. Kerület Címkereső
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '1.1em',
          marginBottom: '5px'
        }}>
          Belváros-Lipótváros címeinek geokódolása
        </p>
        <p style={{ 
          color: '#9ca3af', 
          fontSize: '0.9em' 
        }}>
          Powered by HERE Maps, MapBox & OpenStreetMap
        </p>
      </div>
      
      {/* Search Form */}
      <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={address}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder="Írja be a címet (pl. Váci utca 1, Vörösmarty tér 7-8)"
            style={{
              width: '100%',
              padding: '16px 50px 16px 16px',
              fontSize: '16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          
          {/* Search Icon */}
          <div style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            fontSize: '20px'
          }}>
            🔍
          </div>
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0 0 12px 12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              maxHeight: '300px',
              overflowY: 'auto'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  {suggestion.title}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  {suggestion.address}
                </div>
              </div>
            ))}
          </div>
        )}
      </form>

      {/* Search Button */}
      <button
        onClick={() => handleGeocode(address)}
        disabled={loading || !address.trim()}
        style={{
          width: '100%',
          padding: '14px 24px',
          fontSize: '16px',
          fontWeight: '600',
          backgroundColor: loading || !address.trim() ? '#d1d5db' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: loading || !address.trim() ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          marginBottom: '20px'
        }}
        onMouseEnter={(e) => {
          if (!loading && address.trim()) {
            e.target.style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && address.trim()) {
            e.target.style.backgroundColor = '#3b82f6';
          }
        }}
      >
        {loading ? '🔄 Keresés folyamatban...' : '📍 Cím Geokódolása'}
      </button>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            ❌ Hiba történt:
          </div>
          {error}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div style={{
          padding: '20px',
          backgroundColor: results.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${results.success ? '#bbf7d0' : '#fecaca'}`,
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0',
            color: results.success ? '#166534' : '#dc2626',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {results.success ? '✅ Sikeres geokódolás:' : '❌ Sikertelen geokódolás:'}
          </h3>
          
          {results.success ? (
            <div>
              {/* Basic Info */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <strong>Forrás:</strong> {results.source} {results.cached && '(gyorsítótár)'}
                  </div>
                  <div style={{ color: getConfidenceColor(results.data.confidence) }}>
                    <strong>Pontosság:</strong> {getConfidenceText(results.data.confidence)} ({(results.data.confidence * 100).toFixed(1)}%)
                  </div>
                  <div>
                    <strong>Irányítószám:</strong> {results.data.postal_code || 'N/A'}
                  </div>
                  <div>
                    <strong>Kerület:</strong> {results.data.district || 'V. kerület'}
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div style={{ 
                padding: '16px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  📍 {results.data.formatted_address}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  🌍 Koordináták: {results.data.latitude.toFixed(6)}, {results.data.longitude.toFixed(6)}
                </div>
                {results.data.street_name && (
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    🛣️ Utca: {results.data.street_name} {results.data.house_number || ''}
                  </div>
                )}
              </div>
              
              {/* Map Links */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a 
                  href={addressService.getGoogleMapsUrl(results.data.latitude, results.data.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🗺️ Google Maps
                </a>
                <a 
                  href={addressService.getOpenStreetMapUrl(results.data.latitude, results.data.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🌍 OpenStreetMap
                </a>
              </div>

              {/* Processing Time */}
              {results.duration_ms && (
                <div style={{ 
                  marginTop: '16px', 
                  fontSize: '12px', 
                  color: '#9ca3af' 
                }}>
                  ⏱️ Feldolgozási idő: {results.duration_ms}ms
                </div>
              )}
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 12px 0' }}>{results.error}</p>
              {results.attempted_services && (
                <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                  <strong>Próbált szolgáltatások:</strong> {results.attempted_services.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#9ca3af',
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        marginTop: '40px'
      }}>
        <p>
          🏛️ Budapest V. kerület (Belváros-Lipótváros) hivatalos címadatbázis
        </p>
        <p>
          Geokódolási szolgáltatások: HERE Maps, MapBox, OpenStreetMap Nominatim
        </p>
      </div>
    </div>
  );
};

export default AddressSearch;