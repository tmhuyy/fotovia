import { redirect } from "next/navigation";

export default function LegacyBookingsRoute()
{
    redirect("/photographer/bookings");
}