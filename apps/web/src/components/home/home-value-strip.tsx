import Link from "next/link";

import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const flowSteps = [
    {
        number: "01",
        title: "Choose a visual direction",
        description:
            "Pick the mood, style, and type of photography you want before comparing profiles.",
    },
    {
        number: "02",
        title: "Compare suitable profiles",
        description:
            "Use portfolio work and AI style signals to understand which photographer fits best.",
    },
    {
        number: "03",
        title: "Request the session",
        description:
            "Open the strongest profile and send a focused booking brief with your key details.",
    },
];

export const HomeValueStrip = () =>
{
    return (
        <section className="pb-12 pt-2">
            <Container className="space-y-6">
                <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
                    <div className="space-y-4">
                        <Badge variant="neutral">Booking flow</Badge>

                        <h2 className="max-w-2xl font-serif text-4xl leading-tight text-foreground sm:text-5xl">
                            From style discovery to a real request.
                        </h2>
                    </div>

                    <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base lg:justify-self-end lg:text-right">
                        Fotovia keeps the journey clear: choose the visual direction,
                        compare suitable photographers, then request the session from the
                        profile that feels right.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {flowSteps.map((step, index) => (
                        <Card
                            key={step.number}
                            className="rounded-[1.75rem] border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <CardContent className="space-y-8 p-7">
                                <div className="flex items-center justify-between gap-4">
                                    {/* <span className="text-xs uppercase tracking-[0.24em] text-muted">
                                        {step.number}
                                    </span> */}

                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm text-muted">
                                        {index + 1}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-serif text-3xl leading-tight text-foreground">
                                        {step.title}
                                    </h3>

                                    <p className="text-base leading-7 text-muted">
                                        {step.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-center pt-2">
                    <Link
                        href="/photographers"
                        className={buttonVariants({
                            size: "lg",
                            className: "rounded-full",
                        })}
                    >
                        Browse photographers
                    </Link>
                </div>
            </Container>
        </section>
    );
};