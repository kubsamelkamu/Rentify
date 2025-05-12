import { NextPage } from 'next';
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BedDouble, Bath, Image as ImageIcon, Home, MapPin, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createProperty, Property } from '../../store/slices/propertySlice';
import api from '@/utils/api';
import { motion } from 'framer-motion';

const NewPropertyPage: NextPage = () => {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.properties);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [rentPerMonth, setRentPerMonth] = useState('');
  const [numBedrooms, setNumBedrooms] = useState(1);
  const [numBathrooms, setNumBathrooms] = useState(1);
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = { title, description, city, rentPerMonth, numBedrooms, numBathrooms, propertyType, amenities };
    const resultAction = await dispatch(createProperty(payload));

    if (!createProperty.fulfilled.match(resultAction)) return;
    const created: Property = resultAction.payload;
    const propertyId = created.id;

    if (files.length) {
      const formData = new FormData();
      files.forEach((file) => formData.append('images', file));
      try {
        await api.post(`/api/properties/${propertyId}/images`, 
          formData, { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } catch {
        return;
      }
    }
    router.push(`/properties/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="bg-blue-600 py-6 px-8 text-white">
          <h1 className="text-3xl font-extrabold">List a New Property</h1>
          <p className="mt-1 opacity-80">Reach hundreds of renters</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              <Home className="w-5 h-5 mr-2 text-blue-600" /> Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Cozy Apartment in Downtown"
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              <ImageIcon className="w-5 h-5 mr-2 text-blue-600" /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="This cozy apartment is located in the heart of downtown..."
              rows={4}
              className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" /> City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="e.g. Addis Ababa"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <Tag className="w-5 h-5 mr-2 text-blue-600" /> Rent / month (ብር)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">ብር</span>
                <input
                  type="number"
                  step="0.01"
                  value={rentPerMonth}
                  onChange={(e) => setRentPerMonth(e.target.value)}
                  required
                  placeholder="10000"
                  className="w-full border border-gray-300 px-10 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <BedDouble className="w-5 h-5 mr-2 text-blue-600" /> Bedrooms
              </label>
              <input
                type="number"
                min={1}
                value={numBedrooms}
                onChange={(e) => setNumBedrooms(Number(e.target.value))}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium mb-1">
                <Bath className="w-5 h-5 mr-2 text-blue-600" /> Bathrooms
              </label>
              <input
                type="number"
                min={1}
                value={numBathrooms}
                onChange={(e) => setNumBathrooms(Number(e.target.value))}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Property Type</label>
              <label htmlFor="propertyType" className="block text-sm font-medium mb-1">Property Type</label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="APARTMENT">Apartment</option>
                <option value="HOUSE">House</option>
                <option value="STUDIO">Studio</option>
                <option value="VILLA">Villa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amenities</label>
              <input
                type="text"
                value={amenities.join(', ')}
                onChange={(e) =>
                  setAmenities(
                    e.target.value
                      .split(',')
                      .map((a) => a.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="WiFi, Parking, Air Conditioning"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium mb-1">
              <ImageIcon className="w-5 h-5 mr-2 text-blue-600" /> Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesChange}
              disabled={files.length >= 2}
              className="block"
            />
            {files.length >= 2 && (
              <p className="text-sm text-gray-500 mt-1">Maximum of 2 images uploaded.</p>
            )}
            {previews.length > 0 &&  (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {previews.map((src, idx) => (
                  <img key={idx} src={src} alt={`Preview ${idx + 1}`} className="h-24 w-full object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg disabled:opacity-50"
          >
            {loading ? 'Listing Property…' : 'List Property'}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default NewPropertyPage;
