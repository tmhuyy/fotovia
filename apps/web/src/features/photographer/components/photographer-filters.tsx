import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

interface PhotographerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  specialty: string;
  onSpecialtyChange: (value: string) => void;
  style: string;
  onStyleChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  budget: string;
  onBudgetChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  specialtyOptions: string[];
  styleOptions: string[];
  locationOptions: string[];
}

const selectClassName =
  "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export const PhotographerFilters = ({
  search,
  onSearchChange,
  specialty,
  onSpecialtyChange,
  style,
  onStyleChange,
  location,
  onLocationChange,
  budget,
  onBudgetChange,
  sort,
  onSortChange,
  specialtyOptions,
  styleOptions,
  locationOptions,
}: PhotographerFiltersProps) => {
  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-surface/70 p-4 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
      <div className="space-y-2">
        <Label>Search</Label>
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, style, or location"
        />
      </div>
      <div className="space-y-2">
        <Label>Specialty</Label>
        <select
          value={specialty}
          onChange={(event) => onSpecialtyChange(event.target.value)}
          className={selectClassName}
        >
          <option value="all">All specialties</option>
          {specialtyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Style</Label>
        <select
          value={style}
          onChange={(event) => onStyleChange(event.target.value)}
          className={selectClassName}
        >
          <option value="all">All styles</option>
          {styleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <select
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          className={selectClassName}
        >
          <option value="all">All locations</option>
          {locationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>Budget</Label>
        <select
          value={budget}
          onChange={(event) => onBudgetChange(event.target.value)}
          className={selectClassName}
        >
          <option value="all">Any budget</option>
          <option value="under-400">Under $400</option>
          <option value="400-700">$400 - $700</option>
          <option value="over-700">Over $700</option>
        </select>
      </div>
      <div className="space-y-2 md:col-span-2 lg:col-span-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Sort by</Label>
        </div>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className={selectClassName}
        >
          <option value="recommended">Recommended</option>
          <option value="rating">Highest rated</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </div>
  );
};
