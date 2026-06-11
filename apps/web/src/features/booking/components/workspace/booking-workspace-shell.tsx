import Link from "next/link";
import type { ReactNode } from "react";

import { Section } from "../../../../components/common/section";
import { Footer } from "../../../../components/home/footer";
import { Navbar } from "../../../../components/home/navbar";
import { Container } from "../../../../components/layout/container";

interface BookingWorkspaceShellProps
{
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
    backHref?: string;
    backLabel?: string;
}

export const BookingWorkspaceShell = ({
    eyebrow,
    title,
    description,
    children,
    backHref,
    backLabel,
}: BookingWorkspaceShellProps) =>
{
    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-brand-background">
                <Section className="py-6 sm:py-8 lg:py-10">
                    <Container className="space-y-6">
                        <div className="space-y-4">
                            {backHref && backLabel ? (
                                <Link
                                    href={backHref}
                                    className="inline-flex text-sm font-medium text-brand-muted transition hover:text-brand-primary"
                                >
                                    {backLabel}
                                </Link>
                            ) : null}

                            <div className="space-y-3">
                                <p className="text-sm font-medium uppercase tracking-[0.22em] text-brand-muted">
                                    {eyebrow}
                                </p>

                                <h1 className="font-display text-4xl leading-tight tracking-[-0.04em] text-brand-primary md:text-5xl">
                                    {title}
                                </h1>

                                <p className="max-w-2xl text-base leading-7 text-brand-muted">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {children}
                    </Container>
                </Section>
            </main>

            <Footer />
        </>
    );
};