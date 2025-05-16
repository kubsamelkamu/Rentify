import { FC, useState, ChangeEvent, FormEvent, useContext } from 'react';
import { ThemeContext } from '@/components/context/ThemeContext';

export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  propertyType?: string;
  amenities?: string[];
}

interface FilterPanelProps {
  initial?: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
  onReset?: () => void;
  onCityChange?: (city: string) => void;
}

const propertyTypeOptions = [
  { label: 'Any', value: '' },
  { label: 'Apartment', value: 'APARTMENT' },
  { label: 'House', value: 'HOUSE' },
  { label: 'Studio', value: 'STUDIO' },
  { label: 'Villa', value: 'VILLA' },
];

const FilterPanel: FC<FilterPanelProps> = ({ initial = {}, onApply, onReset, onCityChange }) => {

  const { theme } =  useContext(ThemeContext)!;

  const [city, setCity] = useState(initial.city || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minPrice, setMinPrice] = useState(initial.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice?.toString() || '');
  const [minBedrooms, setMinBedrooms] = useState(initial.minBedrooms?.toString() || '');
  const [maxBedrooms, setMaxBedrooms] = useState(initial.maxBedrooms?.toString() || '');
  const [propertyType, setPropertyType] = useState(initial.propertyType || '');
  const [amenities, setAmenities] = useState<string[]>(initial.amenities || []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onApply({
      city: city || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minBedrooms: minBedrooms ? parseInt(minBedrooms, 10) : undefined,
      maxBedrooms: maxBedrooms ? parseInt(maxBedrooms, 10) : undefined,
      propertyType: propertyType || undefined,
      amenities: amenities.length ? amenities : undefined,
    });
  };

  const handleReset = () => {
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setMaxBedrooms('');
    setPropertyType('');
    setAmenities([]);
    onReset?.();
    onCityChange?.('');
  };
  return (
    <div className={`p-6 rounded-lg shadow mb-6 ${
      theme === 'dark' 
        ? 'bg-gray-900 border-gray-700 text-gray-100' 
        : 'bg-gray-50 border-gray-200 text-gray-800'
    }`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              value={city}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const v = e.target.value;
                setCity(v);
                onCityChange?.(v);
              }}
              placeholder="Search by city"
              className={`w-full border rounded-full px-4 py-2 pr-12 focus:outline-none focus:ring-2 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 focus:ring-blue-500 text-gray-100' 
                  : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-800'
              }`}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className={`${
              theme === 'dark' 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-700'
            } underline`}
          >
            {showAdvanced ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Min Rent</label>
              <input
                type="number"
                min={1000}
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className={`w-full border rounded px-3 py-2 focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 focus:ring-blue-500 text-gray-100' 
                    : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-800'
                }`}
                placeholder="Min"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Max Rent</label>
              <input
                type="number"
                min={1000}
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className={`w-full border rounded px-3 py-2 focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 focus:ring-blue-500 text-gray-100' 
                    : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-800'
                }`}
                placeholder="Max"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Min Beds</label>
              <input
                type="number"
                min={1}
                value={minBedrooms}
                onChange={e => setMinBedrooms(e.target.value)}
                className={`w-full border rounded px-3 py-2 focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 focus:ring-blue-500 text-gray-100' 
                    : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-800'
                }`}
                placeholder="Min"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Max Beds</label>
              <input
                type="number"
                min={1}
                value={maxBedrooms}
                onChange={e => setMaxBedrooms(e.target.value)}
                className={`w-full border rounded px-3 py-2 focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 focus:ring-blue-500 text-gray-100' 
                    : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-800'
                }`}
                placeholder="Max"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Property Type</label>
              <select
                value={propertyType}
                onChange={e => setPropertyType(e.target.value)}
                className={`w-full border rounded px-3 py-2 focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 focus:ring-blue-500 text-gray-100' 
                    : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-800'
                }`}
              >
                {propertyTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>Amenities</label>
              <input
                type="text"
                value={amenities.join(', ')}
                onChange={e => setAmenities(e.target.value.split(',').map(a => a.trim()).filter(Boolean))}
                placeholder="e.g. WiFi, Parking"
                className={`w-full border rounded px-3 py-2 focus:ring-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700 focus:ring-blue-500 text-gray-100' 
                    : 'bg-white border-gray-300 focus:ring-blue-500 text-gray-800'
                }`}
              />
              <p className={`text-xs mt-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>Comma-separated</p>
            </div>
          </div>
        )}
        {showAdvanced && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleReset}
              className={`px-4 py-2 border rounded ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-100' 
                  : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-800'
              }`}
            >Reset</button>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                theme === 'dark' ? 'hover:bg-blue-500' : ''
              }`}
            >Apply</button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FilterPanel;