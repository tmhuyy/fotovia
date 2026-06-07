import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { OpenBookingMarketplacePage } from "../../../features/booking/components/open-booking-marketplace-page";

export default function OpenBookingsRoute()
{
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <OpenBookingMarketplacePage />
            <Footer />
        </div>
    );
}