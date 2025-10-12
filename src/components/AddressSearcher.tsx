'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useThemeColors } from '@/context/ThemeContext';

interface Address {
  id: string;
  fullAddress: string;
  street: string;
  streetType: string;
  houseNumber: string;
  postalCode: string;
  district: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressSearcherProps {
  value?: string;
  onChange: (address: Address | null) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function AddressSearcher({
  value = '',
  onChange,
  placeholder = 'Kezdje el gépelni a címet...',
  required = false,
  className = ''
}: AddressSearcherProps) {
  const themeColors = useThemeColors();
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const searchAddresses = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/addresses/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.addresses);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedIndex(-1);
    
    // Clear selected address if input doesn't match
    if (selectedAddress && !newValue.includes(selectedAddress.fullAddress)) {
      setSelectedAddress(null);
      onChange(null);
    }

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const selectSuggestion = (address: Address) => {
    setInputValue(address.fullAddress);
    setSelectedAddress(address);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onChange(address);
    inputRef.current?.blur();
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
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
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
          placeholder={placeholder}
          required={required}
          className="w-full pl-4 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Location icon */}
        {!isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((address, index) => (
            <div
              key={address.id}
              onClick={() => selectSuggestion(address)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
              }`}
            >
              <div className="font-medium">
                {address.street} {address.houseNumber}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {address.postalCode} Budapest, {address.district}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && !isLoading && inputValue.length >= 2 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
        >
          <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
            Nem találtunk címet a keresési feltételeknek megfelelően.
            <br />
            <span className="text-sm">Kérem, ellenőrizze a helyesírást vagy próbálja meg rövidebben.</span>
          </div>
        </div>
      )}

      {/* Selected address validation indicator */}
      {selectedAddress && (
        <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Érvényes cím kiválasztva
        </div>
      )}
    </div>
  );
}