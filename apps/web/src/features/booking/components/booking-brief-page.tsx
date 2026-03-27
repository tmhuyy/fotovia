import Link from "next/link";
import { Navbar } from "../../../components/home/navbar";
import { Footer } from "../../../components/home/footer";
import { Container } from "../../../components/layout/container";
import { Section } from "../../../components/common/section";
import { Card, CardContent } from "../../../components/ui/card";
import { buttonVariants } from "../../../components/ui/button";
import { budgetOptions, sessionTypeOptions } from "../data/booking-options";

interface BookingBriefPrefill {
  sessionType?: string;
  location?: string;
  date?: string;
  budget?: string;
}

interface BookingBriefPageProps {
  prefill?: BookingBriefPrefill;
}

const resolveLabel = (value: string | undefined, options: { value: string; label: string }[]) => {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
};

const formatValue = (value?: string, fallback = "Not provided") => {
  if (!value || value.trim() === "") return fallback;
  return value;
};

export const BookingBriefPage = ({ prefill }: BookingBriefPageProps) => {
  const sessionTypeLabel = resolveLabel(prefill?.sessionType, sessionTypeOptions);
  const budgetLabel = resolveLabel(prefill?.budget, budgetOptions);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Section className="pt-10">
          <Container className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">
                Booking brief
              </p>
              <h1 className="font-display text-3xl text-foreground md:text-4xl">
                Start a guided booking request.
              </h1>
              <p className="text-sm text-muted md:text-base">
                This guided flow will collect your full brief and suggest photographers who match your vision.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <CardContent className="space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Guided booking is coming next.
                  </h2>
                  <p className="text-sm text-muted">
                    We are preparing a richer booking brief experience. For now, explore photographers or start a direct request from a profile.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/photographers"
                      className={buttonVariants({ size: "sm" })}
                    >
                      Explore photographers
                    </Link>
                    <Link
                      href="/"
                      className={buttonVariants({ variant: "secondary", size: "sm" })}
                    >
                      Back to homepage
                    </Link>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">
                    Quick brief summary
                  </p>
                  <div className="space-y-2 text-sm text-muted">
                    <p>
                      Session type: {formatValue(sessionTypeLabel || prefill?.sessionType)}
                    </p>
                    <p>Location: {formatValue(prefill?.location)}</p>
                    <p>Preferred date: {formatValue(prefill?.date)}</p>
                    <p>
                      Budget: {formatValue(budgetLabel || prefill?.budget)}
                    </p>
                  </div>
                  <p className="text-xs text-muted">
                    We will use this as a starting point when the guided request flow launches.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </div>
  );
};
