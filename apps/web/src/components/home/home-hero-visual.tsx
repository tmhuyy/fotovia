import { Badge } from "../ui/badge";
import { homeDemoImages } from "./home-demo-images";

export const HomeHeroVisual = () =>
{
    const [mainImage, fashionImage, foodImage] = homeDemoImages;

    return (
        <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] border border-border/60 bg-surface/40 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                    <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-muted/40" />
                        <span className="h-2.5 w-2.5 rounded-full bg-muted/30" />
                        <span className="h-2.5 w-2.5 rounded-full bg-muted/20" />
                    </div>

                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted">
                        Fotovia preview
                    </p>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative col-span-2 h-56 overflow-hidden rounded-[1.5rem] border border-border bg-background sm:h-64">
                            <img
                                src={mainImage.src}
                                alt={mainImage.alt}
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,var(--color-foreground))] opacity-35" />

                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                                <div className="space-y-2">
                                    <Badge variant="ai">AI style ready</Badge>

                                    <div>
                                        <p className="font-serif text-3xl text-white">
                                            {mainImage.label}
                                        </p>
                                        <p className="text-sm text-white/75">
                                            {mainImage.style} style signal
                                        </p>
                                    </div>
                                </div>

                                <div className="hidden rounded-full border border-white/60 bg-white/85 px-3 py-2 text-xs font-medium text-foreground shadow-sm sm:block">
                                    92% match
                                </div>
                            </div>
                        </div>

                        {[fashionImage, foodImage].map((image) => (
                            <div
                                key={image.label}
                                className="relative h-36 overflow-hidden rounded-[1.5rem] border border-border bg-background sm:h-44"
                            >
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className="h-full w-full object-cover"
                                />

                                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,var(--color-foreground))] opacity-35" />

                                <div className="absolute bottom-3 left-3 right-3">
                                    <Badge variant="neutral">{image.style}</Badge>
                                    <p className="mt-2 font-serif text-xl text-white">
                                        {image.label}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_13rem]">
                        <div className="rounded-[1.5rem] border border-border bg-background p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted">
                                AI discovery
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {["Cinematic", "Editorial", "Food", "Street"].map((style) => (
                                    <Badge key={style} variant="neutral">
                                        {style}
                                    </Badge>
                                ))}
                            </div>

                            <p className="mt-4 text-sm leading-6 text-muted">
                                Style signals help clients compare photographers faster before
                                starting a booking request.
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] border border-foreground bg-foreground p-4 text-background">
                            <p className="text-xs uppercase tracking-[0.22em] opacity-70">
                                Next step
                            </p>

                            <p className="mt-4 font-serif text-2xl">Send request</p>

                            <p className="mt-2 text-sm leading-6 opacity-75">
                                Confirm date, location, budget, and creative concept.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};