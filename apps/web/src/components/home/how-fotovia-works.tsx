import Link from "next/link";

import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const steps = [
    {
        step: "01",
        title: "Browse by visual style",
        description:
            "Start with the kind of photos you want, not from a long list of generic profiles.",
    },
    {
        step: "02",
        title: "Compare portfolio work",
        description:
            "Open public portfolio items and use AI style signals as a quick discovery layer.",
    },
    {
        step: "03",
        title: "Send a booking request",
        description:
            "Once the visual fit is clear, share your date, location, budget, and session concept.",
    },
];

export const HowFotoviaWorks = () =>
{
    return (
        <section id="how-it-works" className="pb-24 pt-10">
            <Container className="space-y-10">
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                    <div className="space-y-4">
                        <Badge variant="neutral">How it works</Badge>

                        <h2 className="max-w-3xl font-serif text-5xl leading-tight text-foreground sm:text-6xl">
                            A shorter path from visual taste to booking.
                        </h2>
                    </div>

                    <div className="space-y-5 lg:justify-self-end lg:text-right">
                        <p className="max-w-2xl text-base leading-8 text-muted">
                            Fotovia keeps the first experience simple: discover the style,
                            compare real work, then move into a focused booking request.
                        </p>

                        <Link
                            href="/photographers"
                            className={buttonVariants({
                                variant: "secondary",
                                size: "lg",
                                className: "rounded-full",
                            })}
                        >
                            Start with photographers
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {steps.map((item) => (
                        <Card
                            key={item.step}
                            className="rounded-[2rem] border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <CardContent className="space-y-10 p-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-[0.24em] text-muted">
                                        Step {item.step}
                                    </span>

                                    <span className="h-12 w-12 rounded-full border border-border bg-background" />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-serif text-3xl leading-tight text-foreground">
                                        {item.title}
                                    </h3>

                                    <p className="text-base leading-7 text-muted">
                                        {item.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
};