import { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CATEGORIES, MAHARASHTRA_CITIES } from '@/constants';
import type { EventFilters } from '@/types';

interface FilterBarProps {
  filters: EventFilters;
  onFilterChange: (filters: EventFilters) => void;
  showSearch?: boolean;
}

export function FilterBar({ filters, onFilterChange, showSearch = false }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<EventFilters>(filters);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...localFilters, category: value === 'all' ? undefined : value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCityChange = (value: string) => {
    const newFilters = { ...localFilters, city: value === 'all' ? undefined : value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...localFilters, date: e.target.value || undefined };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: EventFilters = {};
    setLocalFilters(clearedFilters);
    setSearchQuery('');
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = localFilters.category || localFilters.city || localFilters.date || searchQuery;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        {showSearch && (
          <div className="relative flex-1">
            <label htmlFor="filter-search" className="sr-only">Search events</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="filter-search"
              name="search"
              type="search"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoComplete="off"
              aria-label="Search events"
            />
          </div>
        )}

        {/* Category Filter */}
        <div className="w-full lg:w-48">
          <label id="filter-category-label" className="sr-only">Category</label>
          <Select
            value={localFilters.category || 'all'}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="filter-category" aria-labelledby="filter-category-label">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Filter */}
        <div className="w-full lg:w-48">
          <label id="filter-city-label" className="sr-only">City</label>
          <Select
            value={localFilters.city || 'all'}
            onValueChange={handleCityChange}
          >
            <SelectTrigger id="filter-city" aria-labelledby="filter-city-label">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {MAHARASHTRA_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="w-full lg:w-48">
          <label htmlFor="filter-date" className="sr-only">Date</label>
          <Input
            id="filter-date"
            name="date"
            type="date"
            value={localFilters.date || ''}
            onChange={handleDateChange}
            placeholder="Select date"
            min={new Date().toISOString().split('T')[0]}
            aria-label="Filter by date"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">Active filters:</span>
          {localFilters.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {CATEGORIES.find(c => c.id === localFilters.category)?.name}
            </span>
          )}
          {localFilters.city && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {localFilters.city}
            </span>
          )}
          {localFilters.date && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {new Date(localFilters.date).toLocaleDateString('en-IN')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
