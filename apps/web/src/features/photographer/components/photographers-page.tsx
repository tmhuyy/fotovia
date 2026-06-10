"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { VIETNAM_LOCATION_OPTIONS } from "../../../shared/data/vietnam-locations";
import { photographerService } from "../../../services/photographer.service";
import type { PhotographerProfile } from "../types/photographer.types";
import { PhotographerCard } from "./photographer-card";
import { PhotographerFilters } from "./photographer-filters";

const SHOOT_STYLE_OPTIONS = [
  "Aerial",
  "Architecture",
  "Event",
  "Fashion",
  "Food",
  "Nature",
  "Sports",
  "Street",
  "Wedding",
  "Wildlife",
];

const normalizeText = (value: string) =>
{
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const resolveInitialStyle = (value: string | null) =>
{
  if (!value?.trim()) return "all";

  const normalizedValue = normalizeText(value);
  const matchedStyle = SHOOT_STYLE_OPTIONS.find(
    (option) => normalizeText(option) === normalizedValue,
  );

  return matchedStyle ?? "all";
};

const budgetMatches = (price: number | null, budget: string) =>
{
  if (budget === "all") return true;
  if (price === null) return false;

  if (budget === "under-500000") {
    return price < 500000;
  }

  if (budget === "500000-1500000") {
    return price >= 500000 && price <= 1500000;
  }

  if (budget === "over-1500000") {
    return price > 1500000;
  }

  return true;
};

const locationMatches = (profileLocation: string, selectedLocation: string) =>
{
  if (selectedLocation === "all") return true;

  const normalizedProfileLocation = normalizeText(profileLocation);
  const selectedOption = VIETNAM_LOCATION_OPTIONS.find(
    (option) => option.value === selectedLocation,
  );

  const acceptedLocationValues = selectedOption
    ? [selectedOption.label, selectedOption.value, ...selectedOption.aliases]
    : [selectedLocation];

  return acceptedLocationValues.some(
    (value) => normalizeText(value) === normalizedProfileLocation,
  );
};

const styleMatches = (photographer: PhotographerProfile, selectedStyle: string) =>
{
  if (selectedStyle === "all") return true;

  const normalizedStyle = normalizeText(selectedStyle);
  const styleValues = [
    photographer.primaryDiscoveryStyle ?? "",
    ...photographer.discoveryStyles,
    ...photographer.styles,
    ...photographer.tags,
  ];

  return styleValues.some((value) => normalizeText(value) === normalizedStyle);
};

const sortProfiles = (
  list: PhotographerProfile[],
  sort: string,
): PhotographerProfile[] =>
{
  if (sort === "style-ready") {
    return [...list].sort((a, b) =>
    {
      if (b.classifiedPortfolioCount !== a.classifiedPortfolioCount) {
        return b.classifiedPortfolioCount - a.classifiedPortfolioCount;
      }

      if (Number(b.hasFeaturedWork) !== Number(a.hasFeaturedWork)) {
        return Number(b.hasFeaturedWork) - Number(a.hasFeaturedWork);
      }

      if (b.portfolioItemCount !== a.portfolioItemCount) {
        return b.portfolioItemCount - a.portfolioItemCount;
      }

      return a.name.localeCompare(b.name);
    });
  }

  if (sort === "price-low") {
    return [...list].sort(
      (a, b) =>
        (a.startingPrice ?? Number.MAX_SAFE_INTEGER) -
        (b.startingPrice ?? Number.MAX_SAFE_INTEGER),
    );
  }

  if (sort === "price-high") {
    return [...list].sort(
      (a, b) => (b.startingPrice ?? -1) - (a.startingPrice ?? -1),
    );
  }

  if (sort === "name") {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  return [...list].sort((a, b) =>
  {
    if (Number(b.hasFeaturedWork) !== Number(a.hasFeaturedWork)) {
      return Number(b.hasFeaturedWork) - Number(a.hasFeaturedWork);
    }

    if (b.classifiedPortfolioCount !== a.classifiedPortfolioCount) {
      return b.classifiedPortfolioCount - a.classifiedPortfolioCount;
    }

    if (b.portfolioItemCount !== a.portfolioItemCount) {
      return b.portfolioItemCount - a.portfolioItemCount;
    }

    return a.name.localeCompare(b.name);
  });
};

const PhotographersPageSkeleton = () =>
{
  return (
    <>
      <Navbar />
      <main className="pb-16 pt-10">
        <Container className="space-y-8">
          <div className="space-y-4">
            <div className="h-5 w-32 animate-pulse rounded bg-border/60" />
            <div className="h-12 w-[32rem] max-w-full animate-pulse rounded bg-border/60" />
            <div className="h-6 w-[36rem] max-w-full animate-pulse rounded bg-border/50" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="h-[30rem] animate-pulse rounded-[2rem] border border-border bg-surface/70" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[34rem] animate-pulse rounded-[2rem] border border-border bg-surface/70"
                />
              ))}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export const PhotographersPage = () =>
{
  const searchParams = useSearchParams();
  const initialStyle = resolveInitialStyle(searchParams.get("style"));

  const [search, setSearch] = useState("");
  const [style, setStyle] = useState(initialStyle);
  const [location, setLocation] = useState("all");
  const [budget, setBudget] = useState("all");
  const [sort, setSort] = useState("recommended");

  const photographersQuery = useQuery({
    queryKey: ["public-photographers-discovery"],
    queryFn: () => photographerService.getPublicPhotographers(),
    retry: false,
  });

  const photographerList = photographersQuery.data ?? [];

  const filtered = useMemo(() =>
  {
    const normalizedSearch = normalizeText(search);

    const results = photographerList.filter((item) =>
    {
      const searchHaystack = [
        item.name,
        item.specialty,
        item.location,
        item.bio,
        item.discoveryStyles.join(" "),
        item.styles.join(" "),
        item.tags.join(" "),
        item.primaryDiscoveryStyle ?? "",
      ]
        .join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const matchesSearch = normalizedSearch
        ? searchHaystack.includes(normalizedSearch)
        : true;

      const matchesStyle = styleMatches(item, style);
      const matchesLocation = locationMatches(item.location, location);
      const matchesBudget = budgetMatches(item.startingPrice, budget);

      return (
        matchesSearch &&
        matchesStyle &&
        matchesLocation &&
        matchesBudget
      );
    });

    return sortProfiles(results, sort);
  }, [budget, location, photographerList, search, sort, style]);

  const hasActiveFilters =
    search.trim() !== "" ||
    style !== "all" ||
    location !== "all" ||
    budget !== "all" ||
    sort !== "recommended";

  const aiReadyCount = photographerList.filter(
    (item) => item.classifiedPortfolioCount > 0,
  ).length;

  const handleReset = () =>
  {
    setSearch("");
    setStyle("all");
    setLocation("all");
    setBudget("all");
    setSort("recommended");
  };

  if (photographersQuery.isLoading) {
    return <PhotographersPageSkeleton />;
  }

  if (photographersQuery.isError) {
    return (
      <>
        <Navbar />
        <main className="pb-16 pt-10">
          <Container>
            <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
              <CardContent className="space-y-4 p-8">
                <h1 className="font-serif text-3xl text-foreground">
                  We couldn’t load photographers right now
                </h1>

                <p className="text-sm leading-6 text-muted">
                  Please try again in a moment.
                </p>

                <Button
                  type="button"
                  className="cursor-pointer rounded-full"
                  onClick={() => photographersQuery.refetch()}
                >
                  Try again
                </Button>
              </CardContent>
            </Card>
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pb-16 pt-10">
        <Container className="space-y-8">
          <section className="space-y-5">

            <div className="max-w-4xl space-y-3">
              <h1 className="font-serif text-4xl text-foreground sm:text-5xl lg:text-6xl">
                Fotovia's Photographers
              </h1>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <span>
                {filtered.length} photographer
                {filtered.length === 1 ? "" : "s"} found
              </span>

            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">
              Quick style entry
            </p>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={style === "all" ? "primary" : "secondary"}
                className="cursor-pointer"
                onClick={() => setStyle("all")}
              >
                All styles
              </Button>

              {SHOOT_STYLE_OPTIONS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={
                    style === option ? "primary" : "secondary"
                  }
                  className="cursor-pointer"
                  onClick={() => setStyle(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </section>

          <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Card className="h-fit rounded-[2rem] border-border bg-surface shadow-sm">
              <CardContent className="space-y-6 p-6">
                <div className="overflow-hidden rounded-[1.75rem] border border-border bg-background">
                  <div className="bg-[radial-gradient(circle_at_25%_20%,rgba(214,187,145,0.45),transparent_36%),radial-gradient(circle_at_80%_0%,rgba(237,229,255,0.7),transparent_38%)] px-5 py-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted">
                      Filter discovery
                    </p>

                    <h2 className="mt-3 font-serif text-3xl text-foreground">
                      Keep it simple
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-muted">
                      Search, choose a style, then compare
                      real Fotovia portfolios.
                    </p>
                  </div>
                </div>

                <PhotographerFilters
                  search={search}
                  onSearchChange={setSearch}
                  style={style}
                  onStyleChange={setStyle}
                  location={location}
                  onLocationChange={setLocation}
                  budget={budget}
                  onBudgetChange={setBudget}
                  sort={sort}
                  onSortChange={setSort}
                  styleOptions={SHOOT_STYLE_OPTIONS}
                  locationOptions={VIETNAM_LOCATION_OPTIONS.map(
                    (option) => option.value,
                  )}
                />

                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full cursor-pointer rounded-2xl"
                    onClick={handleReset}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            {filtered.length ? (
              <div className="grid items-stretch gap-6 md:grid-cols-2">
                {filtered.map((photographer) => (
                  <PhotographerCard
                    key={photographer.id}
                    photographer={photographer}
                  />
                ))}
              </div>
            ) : (
              <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                <CardContent className="space-y-4 p-8">
                  <h2 className="font-serif text-3xl text-foreground">
                    No matches yet
                  </h2>

                  <p className="text-sm leading-7 text-muted">
                    Try adjusting your search, style, or
                    location filter to discover more
                    photographers.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
                    className="cursor-pointer rounded-full"
                    onClick={handleReset}
                  >
                    Reset filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};