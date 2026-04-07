import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

interface PhotographerFiltersProps
{
  search: string;
  onSearchChange: (value: string) => void;
  style: string;
  onStyleChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  budget: string;
  onBudgetChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  styleOptions: string[];
  locationOptions: string[];
}

const selectClassName =
  "h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

export const PhotographerFilters = ({
  search,
  onSearchChange,
  style,
  onStyleChange,
  location,
  onLocationChange,
  budget,
  onBudgetChange,
  sort,
  onSortChange,
  styleOptions,
  locationOptions,
}: PhotographerFiltersProps) =>
{
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="photographer-search">Search</Label>
        <Input
          id="photographer-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, style, or location"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="photographer-style">AI style</Label>
        <select
          id="photographer-style"
          value={style}
          onChange={(event) => onStyleChange(event.target.value)}
          className={selectClassName}
        >
          <option value="all">All detected styles</option>
          {styleOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photographer-location">Location</Label>
        <select
          id="photographer-location"
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
        <Label htmlFor="photographer-budget">Budget</Label>
        <select
          id="photographer-budget"
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

      <div className="space-y-2">
        <Label htmlFor="photographer-sort">Sort by</Label>
        <select
          id="photographer-sort"
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
          className={selectClassName}
        >
          <option value="recommended">Recommended</option>
          <option value="style-ready">Most AI-ready</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>
    </div>
  );
};