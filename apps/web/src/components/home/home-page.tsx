import { FeaturedPhotographers } from "./featured-photographers";
import { Footer } from "./footer";
import { HeroSection } from "./hero-section";
import { HomeValueStrip } from "./home-value-strip";
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
            </main>

            <Footer />
        </div>
    );
};