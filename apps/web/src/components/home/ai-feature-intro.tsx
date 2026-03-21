import { Badge } from "../ui/badge";
import { Section } from "../common/section";
import { Container } from "../layout/container";
import { Button } from "../ui/button";

export const AiFeatureIntro = () => {
  return (
    <Section className="bg-brand-surface">
      <Container className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="space-y-5">
          <Badge variant="ai">AI Style Match</Badge>
          <h2 className="font-display text-3xl text-brand-primary md:text-4xl">
            Upload an inspiration image and meet photographers who match it.
          </h2>
          <p className="text-base leading-relaxed text-brand-muted">
            Fotovia analyzes composition, light, and mood to classify your
            preferred style. We then surface photographers with portfolios that
            align with the look you love.
          </p>
          <Button variant="secondary">See How It Works</Button>
        </div>
        <div className="rounded-3xl border border-brand-border bg-brand-background p-6 shadow-sm">
          <div className="space-y-6 rounded-2xl bg-brand-surface p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-brand-primary">
                Style Classification
              </p>
              <Badge variant="ai">Cinematic</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-32 rounded-2xl border border-brand-border bg-brand-background" />
              <div className="flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-background p-4 text-sm text-brand-muted">
                <p>Suggested photographers</p>
                <p className="font-display text-xl text-brand-primary">
                  14 Matches
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
};
