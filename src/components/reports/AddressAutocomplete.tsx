'use client';

import { useState, useEffect, useRef } from 'react';

interface AddressOption {
  id: string;
  fullAddress: string;
  street: string;
  streetType: string;
  houseNumber: string;
  building?: string;
  entrance?: string;
  postalCode: string;
  district: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressAutocompleteProps {
  selectedAddress?: string;
  selectedAddressId?: string;
  onAddressChange: (address: string, addressId?: string, postalCode?: string) => void;
  error?: string;
}

export function AddressAutocomplete({
  selectedAddress = '',
  selectedAddressId,
  onAddressChange,
  error
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(selectedAddress);
  const [suggestions, setSuggestions] = useState<AddressOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (inputValue.length >= 2) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/addresses/search?q=${encodeURIComponent(inputValue)}&limit=8`);
          const data = await response.json();
          
          if (data.success) {
            setSuggestions(data.addresses);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error('Address search error:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [inputValue]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);
    
    // If user is typing, clear the selected address ID
    if (value !== selectedAddress) {
      onAddressChange(value, undefined, undefined);
    }
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion: AddressOption) => {
    setInputValue(suggestion.fullAddress);
    onAddressChange(suggestion.fullAddress, suggestion.id, suggestion.postalCode);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Helyszín (cím) *
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Kezdje gépelni a címet... (pl. Váci utca 15)"
          autoComplete="off"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => selectSuggestion(suggestion)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-blue-50 text-blue-900' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-900">
                {suggestion.fullAddress}
              </div>
              <div className="text-sm text-gray-600">
                {suggestion.district} • {suggestion.postalCode}
                {suggestion.building && ` • ${suggestion.building}`}
                {suggestion.entrance && ` • ${suggestion.entrance}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && inputValue.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-gray-600 text-sm">
            Nem található cím: &quot;{inputValue}&quot;
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Csak V. kerületi címek közül választhat. Próbálja meg pontosítani a keresést.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Selected address confirmation */}
      {selectedAddressId && inputValue && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Cím megerősítve: {inputValue}
          </p>
        </div>
      )}

      {/* Address entry help */}
      <p className="mt-1 text-xs text-gray-500">
        💡 Tipp: Írja be az utca nevét és a házszámot (pl. &quot;Váci utca 15&quot;)
      </p>
    </div>
  );
}