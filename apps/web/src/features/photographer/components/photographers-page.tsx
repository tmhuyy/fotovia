"use client";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import { Button, buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { PhotographerFilters } from "./photographer-filters";
import { PhotographerCard } from "./photographer-card";
import { photographerService } from "../../../services/photographer.service";
import type { PhotographerProfile } from "../types/photographer.types";

const budgetMatches = (price: number | null, budget: string) =>
{
  if (price === null) return budget === "all";

  if (budget === "under-400") return price < 400;
  if (budget === "400-700") return price >= 400 && price <= 700;
  if (budget === "over-700") return price > 700;

  return true;
};

const sortProfiles = (
  list: PhotographerProfile[],
  sort: string,
): PhotographerProfile[] =>
{
  if (sort === "rating") {
    return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  }

  if (sort === "price-low") {
    return [...list].sort(
      (a, b) => (a.startingPrice ?? Number.MAX_SAFE_INTEGER) - (b.startingPrice ?? Number.MAX_SAFE_INTEGER),
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

  return list;
};

const PhotographersPageSkeleton = () =>
{
  return (
    <>
      <Navbar />
      <main className="pb-16 pt-10">
        <Container className="space-y-8">
          <div className="space-y-4">
            <div className="h-5 w-28 animate-pulse rounded bg-border/60" />
            <div className="h-12 w-80 animate-pulse rounded bg-border/60" />
            <div className="h-6 w-[32rem] max-w-full animate-pulse rounded bg-border/50" />
          </div>

          <div className="h-24 animate-pulse rounded-[2rem] border border-border bg-surface/60" />

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-[2rem] border border-border bg-surface/60"
              />
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export const PhotographersPage = () =>
{
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [style, setStyle] = useState("all");
  const [location, setLocation] = useState("all");
  const [budget, setBudget] = useState("all");
  const [sort, setSort] = useState("recommended");

  const photographersQuery = useQuery({
    queryKey: ["public-photographers"],
    queryFn: () => photographerService.getPublicPhotographers(),
    retry: false,
  });

  const photographerList = photographersQuery.data ?? [];

  const specialtyOptions = useMemo(() =>
  {
    return Array.from(new Set(photographerList.map((item) => item.specialty)));
  }, [photographerList]);

  const styleOptions = useMemo(() =>
  {
    return Array.from(
      new Set(photographerList.flatMap((item) => item.styles)),
    );
  }, [photographerList]);

  const locationOptions = useMemo(() =>
  {
    return Array.from(new Set(photographerList.map((item) => item.location)));
  }, [photographerList]);

  const filtered = useMemo(() =>
  {
    const normalizedSearch = search.trim().toLowerCase();

    const results = photographerList.filter((item) =>
    {
      const matchesSearch = normalizedSearch
        ? [
          item.name,
          item.specialty,
          item.location,
          item.bio,
          item.styles.join(" "),
          item.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch)
        : true;

      const matchesSpecialty =
        specialty === "all" || item.specialty === specialty;
      const matchesStyle = style === "all" || item.styles.includes(style);
      const matchesLocation = location === "all" || item.location === location;
      const matchesBudget = budgetMatches(item.startingPrice, budget);

      return (
        matchesSearch &&
        matchesSpecialty &&
        matchesStyle &&
        matchesLocation &&
        matchesBudget
      );
    });

    return sortProfiles(results, sort);
  }, [budget, location, photographerList, search, sort, specialty, style]);

  const hasActiveFilters =
    search.trim() !== "" ||
    specialty !== "all" ||
    style !== "all" ||
    location !== "all" ||
    budget !== "all" ||
    sort !== "recommended";

  const handleReset = () =>
  {
    setSearch("");
    setSpecialty("all");
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
                <div className="space-y-2">
                  <h1 className="font-serif text-3xl text-foreground">
                    We couldn’t load photographers right now
                  </h1>

                  <p className="text-sm leading-6 text-muted">
                    Please try again in a moment.
                  </p>
                </div>

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
          <Section className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted">
                Discover
              </p>

              <div className="space-y-3">
                <h1 className="font-serif text-4xl text-foreground sm:text-5xl">
                  Explore photographers curated for your vision.
                </h1>

                <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                  Browse real photographer profiles and saved portfolio work from
                  the latest backend source of truth.
                </p>
              </div>
            </div>

            <PhotographerFilters
              search={search}
              specialty={specialty}
              style={style}
              location={location}
              budget={budget}
              sort={sort}
              specialtyOptions={specialtyOptions}
              styleOptions={styleOptions}
              locationOptions={locationOptions}
              onSearchChange={setSearch}
              onSpecialtyChange={setSpecialty}
              onStyleChange={setStyle}
              onLocationChange={setLocation}
              onBudgetChange={setBudget}
              onSortChange={setSort}
            />

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted">
                {filtered.length} photographer{filtered.length === 1 ? "" : "s"} found
              </p>

              {hasActiveFilters ? (
                <button
                  type="button"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  onClick={handleReset}
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            {filtered.length ? (
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
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
                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl text-foreground">
                      No matches yet
                    </h2>

                    <p className="text-sm leading-6 text-muted">
                      Try adjusting your filters to discover more photographers.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-full"
                    onClick={handleReset}
                  >
                    Reset filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </Section>
        </Container>
      </main>
      <Footer />
    </>
  );
};