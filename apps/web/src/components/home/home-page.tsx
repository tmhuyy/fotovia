import { FeaturedPhotographers } from "./featured-photographers";
import { Footer } from "./footer";
import { HeroSection } from "./hero-section";
import { HomeShootStyleCarousel } from "./home-shoot-style-carousel";
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
                <HomeShootStyleCarousel />
                <FeaturedPhotographers />
            </main>

            <Footer />
        </div>
    );
};