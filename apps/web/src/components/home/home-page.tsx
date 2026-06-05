import { FeaturedPhotographers } from "./featured-photographers";
import { Footer } from "./footer";
import { HeroSection } from "./hero-section";
import { HomeValueStrip } from "./home-value-strip";
import { Navbar } from "./navbar";
import { OpeningBookingRequests } from "./opening-booking-requests";

export const HomePage = () =>
{
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main>
                <HeroSection />
                <OpeningBookingRequests />
                <HomeValueStrip />
                <FeaturedPhotographers />
            </main>

            <Footer />
        </div>
    );
};