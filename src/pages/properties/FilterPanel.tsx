import { FC, useState, ChangeEvent, FormEvent, useContext } from 'react';
import { ThemeContext } from '@/components/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Range } from 'react-range';
import { Home, Tag, Bed, ListChecks, X } from 'lucide-react';

export interface PropertyFilters {
  city?: string;
  priceRange?: [number, number];
  bedrooms?: [number, number];
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
const amenitiesOptions = ['WiFi', 'Parking', 'Pool', 'Gym', 'Pet Friendly'];

const FilterPanel: FC<FilterPanelProps> = ({ initial = {}, onApply, onReset, onCityChange }) => {

  const { theme } = useContext(ThemeContext)!;
  const [city, setCity] = useState(initial.city || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>(initial.priceRange || [5000, 100000]);
  const [bedrooms, setBedrooms] = useState<[number, number]>(initial.bedrooms || [1, 10]);
  const [propertyType, setPropertyType] = useState(initial.propertyType || '');
  const [amenities, setAmenities] = useState<string[]>(initial.amenities || []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onApply({ city: city || undefined, priceRange, bedrooms, propertyType: propertyType || undefined, amenities: amenities.length ? amenities : undefined });
  };

  const handleReset = () => {
    setCity('');
    setPriceRange([5000, 50000]);
    setBedrooms([1, 4]);
    setPropertyType('');
    setAmenities([]);
    onReset?.();
    onCityChange?.('');
  };

  const ringColor = theme === 'light' ? 'focus:ring-blue-500' : 'focus:ring-blue-400';

  return (
    <div className={`p-6 *: rounded-2xl shadow-lg border mb-6 bg-${theme === 'light' ? 'white' : 'gray-900'} border-${theme === 'light' ? 'gray-200' : 'gray-700'} text-${theme === 'light' ? 'gray-800' : 'gray-100'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Home className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            value={city}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setCity(e.target.value); onCityChange?.(e.target.value); }}
            placeholder="Search by city"
            className={`pl-10 pr-4 py-2 w-full border rounded-full bg-${theme === 'light' ? 'gray-50' : 'gray-800'} border-${theme === 'light' ? 'gray-300' : 'gray-700'} ${ringColor} text-${theme === 'light' ? 'gray-800' : 'gray-100'}`}
          />
        </div>
        <div className="text-center">
          <button type="button" onClick={() => setShowAdvanced(v => !v)} className="underline text-blue-600 hover:text-blue-500">
            {showAdvanced ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              key="advanced"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div>
                <label className="block mb-1 font-medium">Price Range (Br)</label>
                <div className={`px-3 py-2 border rounded-lg border-${theme === 'light' ? 'gray-300' : 'gray-700'}`}>                  
                  <Range
                    step={5000}
                    min={0}
                    max={100000}
                    values={priceRange}
                    onChange={(vals) => setPriceRange([vals[0], vals[1]])}
                    renderTrack={({ props, children }) => (
                      <div {...props} className={`h-1 w-full bg-${theme === 'light' ? 'blue-200' : 'blue-700'} rounded`}>{children}</div>
                    )}
                    renderThumb={({ props }) => <div {...props} className="h-4 w-4 rounded-full bg-blue-500" />}
                  />
                  <div className="flex justify-between mt-2">
                    <span>{priceRange[0]} Br</span>
                    <span>{priceRange[1]} Br</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-1 font-medium">
                  <Bed className="mr-2" />
                  <span>Bedrooms</span>
                </div>
                <div className={`px-3 py-2 border rounded-lg border-${theme === 'light' ? 'gray-300' : 'gray-700'}`}>                  
                  <Range
                    step={1}
                    min={1}
                    max={12}
                    values={bedrooms}
                    onChange={(vals) => setBedrooms([vals[0], vals[1]])}
                    renderTrack={({ props, children }) => (
                      <div {...props} className={`h-1 w-full bg-${theme === 'light' ? 'blue-200' : 'blue-700'} rounded`}>{children}</div>
                    )}
                    renderThumb={({ props }) => <div {...props} className="h-4 w-4 rounded-full bg-blue-500" />}
                  />
                  <div className="flex justify-between mt-2">
                    <span>{bedrooms[0]} bd</span>
                    <span>{bedrooms[1]} bd</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Property Type</label>
                <div className="relative">
                  <Tag className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                    className={`pl-10 pr-4 py-2 w-full border rounded-lg bg-${theme === 'light' ? 'gray-50' : 'gray-800'} border-${theme === 'light' ? 'gray-300' : 'gray-700'} focus:outline-none ${ringColor} text-${theme === 'light' ? 'gray-800' : 'gray-100'}`}
                  >
                    {propertyTypeOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesOptions.map(opt => {
                    const selected = amenities.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAmenities(sel => selected ? sel.filter(a => a !== opt) : [...sel, opt])}
                        className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${selected ? 'bg-blue-600 text-white border-blue-600' : `bg-${theme === 'light' ? 'gray-50 text-gray-800' : 'gray-800 text-gray-100'} border-gray-300`} hover:opacity-90`}
                      >
                        <ListChecks className="w-4 h-4" />
                        <span>{opt}</span>
                        {selected && <X className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={handleReset} className="px-4 py-2 border rounded-lg bg-transparent hover:bg-gray-100">
                  Reset
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Apply
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default FilterPanel;
