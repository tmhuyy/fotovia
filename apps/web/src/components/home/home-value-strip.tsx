import Link from "next/link";

import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";

const discoveryEntries = [
    {
        title: "Browse by AI style",
        description:
            "Jump straight into photographer discovery by detected portfolio style instead of long explanation-heavy flows.",
        href: "/photographers",
        cta: "Explore styles",
    },
    {
        title: "Compare real portfolio work",
        description:
            "Open cover and gallery images from saved portfolio items to compare visual fit quickly.",
        href: "/photographers",
        cta: "View public portfolios",
    },
    {
        title: "Book once you’re confident",
        description:
            "Discovery stays lightweight, then the booking flow takes over when the match already feels right.",
        href: "/photographers",
        cta: "Start browsing",
    },
];

export const HomeValueStrip = () =>
{
    return (
        <section className="pb-6 pt-2">
            <Container className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="neutral">Core flow</Badge>
                    <p className="text-sm text-muted">
                        Browse style. Compare work. Send request.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {discoveryEntries.map((entry) => (
                        <Card
                            key={entry.title}
                            className="rounded-[2rem] border-border bg-surface shadow-sm"
                        >
                            <CardContent className="space-y-4 p-6">
                                <h2 className="font-serif text-2xl text-foreground">
                                    {entry.title}
                                </h2>

                                <p className="text-sm leading-7 text-muted">
                                    {entry.description}
                                </p>

                                <Link
                                    href={entry.href}
                                    className="text-sm font-medium text-foreground"
                                >
                                    {entry.cta} →
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Container>
        </section>
    );
};