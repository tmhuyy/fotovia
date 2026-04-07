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
import { photographerService } from "../../../services/photographer.service";
import type { PhotographerProfile } from "../types/photographer.types";
import { PhotographerCard } from "./photographer-card";
import { PhotographerFilters } from "./photographer-filters";

const budgetMatches = (price: number | null, budget: string) =>
{
  if (price === null) {
    return budget === "all";
  }

  if (budget === "under-400") {
    return price < 400;
  }

  if (budget === "400-700") {
    return price >= 400 && price <= 700;
  }

  if (budget === "over-700") {
    return price > 700;
  }

  return true;
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

          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="h-[24rem] animate-pulse rounded-[2rem] border border-border bg-surface/70" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[25rem] animate-pulse rounded-[2rem] border border-border bg-surface/70"
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
  const initialStyle = searchParams.get("style")?.trim() || "all";

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

  const styleOptions = useMemo(() =>
  {
    return Array.from(
      new Set(
        photographerList.flatMap((item) =>
          item.discoveryStyles.length
            ? item.discoveryStyles
            : item.styles,
        ),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [photographerList]);

  const locationOptions = useMemo(() =>
  {
    return Array.from(new Set(photographerList.map((item) => item.location))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [photographerList]);

  const quickStyles = useMemo(() =>
  {
    return styleOptions.slice(0, 6);
  }, [styleOptions]);

  const filtered = useMemo(() =>
  {
    const normalizedSearch = search.trim().toLowerCase();

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
        .toLowerCase();

      const matchesSearch = normalizedSearch
        ? searchHaystack.includes(normalizedSearch)
        : true;

      const matchesStyle =
        style === "all"
          ? true
          : item.primaryDiscoveryStyle === style ||
          item.discoveryStyles.includes(style) ||
          item.styles.includes(style);

      const matchesLocation =
        location === "all" ? true : item.location === location;

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
                  className="rounded-full"
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
            <Badge variant="ai">AI style discovery</Badge>

            <div className="space-y-3">
              <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
                Find photographers by real portfolio style.
              </h1>

              <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                Browse public profiles using AI-detected style
                signals from real portfolio work instead of long,
                instruction-heavy browsing flows.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="neutral">
                {filtered.length} photographer
                {filtered.length === 1 ? "" : "s"} found
              </Badge>

              <Badge variant="neutral">
                {photographerList.filter(
                  (item) => item.classifiedPortfolioCount > 0,
                ).length}{" "}
                with AI-ready portfolios
              </Badge>

              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
          </section>

          {quickStyles.length ? (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Quick style entry
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={style === "all" ? "primary" : "secondary"}
                  onClick={() => setStyle("all")}
                >
                  All styles
                </Button>

                {quickStyles.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    size="sm"
                    variant={
                      style === option ? "primary" : "secondary"
                    }
                    onClick={() => setStyle(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <Card className="h-fit rounded-[2rem] border-border bg-surface shadow-sm">
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted">
                    Filter discovery
                  </p>

                  <h2 className="font-serif text-2xl text-foreground">
                    Keep it simple
                  </h2>

                  <p className="text-sm leading-6 text-muted">
                    Search, pick an AI style, then compare real
                    portfolios.
                  </p>
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
                  styleOptions={styleOptions}
                  locationOptions={locationOptions}
                />
              </CardContent>
            </Card>

            {filtered.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                    Try adjusting your search or AI style filter
                    to discover more photographers.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
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