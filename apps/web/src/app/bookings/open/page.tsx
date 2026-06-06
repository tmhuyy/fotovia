import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { OpeningBookingRequests } from "../../../components/home/opening-booking-requests";

export default function OpenBookingsRoute()
{
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pb-16 pt-10 sm:pb-20 sm:pt-14">
                <OpeningBookingRequests
                    variant="page"
                    limit={50}
                    maxVisibleRequests={50}
                    showBookNowCta={false}
                    title="Open Photoshoot Requests"
                    subtitle="Browse all available client requests and apply to the photoshoots that match your style, schedule, and pricing."
                />
            </main>

            <Footer />
        </div>
    );
}