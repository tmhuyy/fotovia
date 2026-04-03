"use client";

import { useMemo, useState } from "react";
import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import { buttonVariants } from "../../../components/ui/button";
import { PhotographerFilters } from "./photographer-filters";
import { PhotographerCard } from "./photographer-card";
import { mockPhotographers } from "../data/mock-photographers";
import type { PhotographerProfile } from "../types/photographer.types";

const budgetMatches = (price: number, budget: string) => {
  if (budget === "under-400") return price < 400;
  if (budget === "400-700") return price >= 400 && price <= 700;
  if (budget === "over-700") return price > 700;
  return true;
};

const sortProfiles = (
  list: PhotographerProfile[],
  sort: string
): PhotographerProfile[] => {
  if (sort === "rating") {
    return [...list].sort((a, b) => b.rating - a.rating);
  }
  if (sort === "price-low") {
    return [...list].sort((a, b) => a.startingPrice - b.startingPrice);
  }
  if (sort === "price-high") {
    return [...list].sort((a, b) => b.startingPrice - a.startingPrice);
  }
  if (sort === "name") {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
};

export const PhotographersPage = () => {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [style, setStyle] = useState("all");
  const [location, setLocation] = useState("all");
  const [budget, setBudget] = useState("all");
  const [sort, setSort] = useState("recommended");

  const specialtyOptions = useMemo(() => {
    return Array.from(new Set(mockPhotographers.map((item) => item.specialty)));
  }, []);

  const styleOptions = useMemo(() => {
    return Array.from(
      new Set(mockPhotographers.flatMap((item) => item.styles))
    );
  }, []);

  const locationOptions = useMemo(() => {
    return Array.from(new Set(mockPhotographers.map((item) => item.location)));
  }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const results = mockPhotographers.filter((item) => {
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

      const matchesSpecialty = specialty === "all" || item.specialty === specialty;
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
  }, [budget, location, search, sort, specialty, style]);

  const hasActiveFilters =
    search.trim() !== "" ||
    specialty !== "all" ||
    style !== "all" ||
    location !== "all" ||
    budget !== "all" ||
    sort !== "recommended";

  const handleReset = () => {
    setSearch("");
    setSpecialty("all");
    setStyle("all");
    setLocation("all");
    setBudget("all");
    setSort("recommended");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Section className="pt-10">
          <Container className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Discover
              </p>
              <h1 className="font-display text-3xl text-foreground md:text-4xl">
                Explore photographers curated for your vision.
              </h1>
              <p className="text-sm text-muted md:text-base">
                Filter by specialty, style, and location to find the perfect creative partner.
              </p>
            </div>

            <PhotographerFilters
              search={search}
              onSearchChange={setSearch}
              specialty={specialty}
              onSpecialtyChange={setSpecialty}
              style={style}
              onStyleChange={setStyle}
              location={location}
              onLocationChange={setLocation}
              budget={budget}
              onBudgetChange={setBudget}
              sort={sort}
              onSortChange={setSort}
              specialtyOptions={specialtyOptions}
              styleOptions={styleOptions}
              locationOptions={locationOptions}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {filtered.length} photographer{filtered.length === 1 ? "" : "s"} found
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={handleReset}
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            {filtered.length ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((photographer) => (
                  <PhotographerCard
                    key={photographer.id}
                    photographer={photographer}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-surface p-10 text-center">
                <p className="text-lg font-medium text-foreground">
                  No matches yet
                </p>
                <p className="mt-2 text-sm text-muted">
                  Try adjusting your filters to discover more photographers.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className={`${buttonVariants({ variant: "secondary", size: "sm" })} mt-4`}
                >
                  Reset filters
                </button>
              </div>
            )}
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
};
