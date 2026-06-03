import { FeaturedPhotographers } from "./featured-photographers";
import { Footer } from "./footer";
import { HeroSection } from "./hero-section";
import { HomeValueStrip } from "./home-value-strip";
import { HowFotoviaWorks } from "./how-fotovia-works";
import { Navbar } from "./navbar";

export const HomePage = () =>
{
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main>
                <HeroSection />
                <HomeValueStrip />
                <FeaturedPhotographers />
                <HowFotoviaWorks />
            </main>

            <Footer />
        </div>
    );
};