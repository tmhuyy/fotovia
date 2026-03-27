import { mockPhotographers } from "./mock-photographers";
import type { PhotographerDetail } from "../types/photographer-detail.types";
import type { PhotographerProfile } from "../types/photographer.types";

const detailExtras: Record<
  string,
  Omit<PhotographerDetail, keyof PhotographerProfile>
> = {
  "studio-reverie": {
    intro:
      "Studio Reverie creates editorial portrait experiences with a fashion-first approach, balancing refined lighting with cinematic tone.",
    experienceYears: 8,
    availability: "Booking 3-4 weeks out · Weekday mornings preferred",
    services: [
      {
        title: "Signature editorial session",
        description:
          "A 2-hour studio or on-location session with styling guidance and full retouching.",
        duration: "2 hours",
        startingPrice: 950,
      },
      {
        title: "Brand story capture",
        description:
          "Half-day coverage for founders and teams focused on narrative-led visuals.",
        duration: "4 hours",
        startingPrice: 1600,
      },
    ],
    portfolio: [
      "reverie-1",
      "reverie-2",
      "reverie-3",
      "reverie-4",
      "reverie-5",
      "reverie-6",
    ],
    testimonials: [
      {
        name: "Elena M.",
        context: "Founder portrait session",
        quote:
          "Every frame felt intentional. The team guided me through styling and delivered images that feel truly editorial.",
      },
      {
        name: "Kai T.",
        context: "Magazine feature",
        quote:
          "They captured the mood and luxury we needed for our cover story. The lighting was impeccable.",
      },
    ],
  },
  "northlight-collective": {
    intro:
      "Northlight Collective focuses on authentic wedding storytelling with refined editorial touches and timeless color.",
    experienceYears: 10,
    availability: "Limited 2024 weekends · Weekday elopements open",
    services: [
      {
        title: "Wedding documentary",
        description:
          "Full-day coverage with two photographers and curated preview gallery.",
        duration: "8 hours",
        startingPrice: 2400,
      },
      {
        title: "Intimate celebration",
        description:
          "Up to 4 hours of coverage for micro-weddings and elopements.",
        duration: "4 hours",
        startingPrice: 1400,
      },
    ],
    portfolio: [
      "northlight-1",
      "northlight-2",
      "northlight-3",
      "northlight-4",
      "northlight-5",
    ],
    testimonials: [
      {
        name: "Amelia & Ross",
        context: "Wedding in Seattle",
        quote:
          "They captured every quiet moment with care. The gallery feels both cinematic and intimate.",
      },
    ],
  },
  "maison-noir": {
    intro:
      "Maison Noir crafts luxurious brand imagery with a minimalist, high-design aesthetic.",
    experienceYears: 12,
    availability: "Open for Q2 brand campaigns",
    services: [
      {
        title: "Luxury brand campaign",
        description:
          "A full-day shoot with creative direction, styling, and moodboard development.",
        duration: "1 day",
        startingPrice: 3200,
      },
      {
        title: "Founder portraits",
        description:
          "Polished portraits for executives and founders in studio or on location.",
        duration: "90 minutes",
        startingPrice: 900,
      },
    ],
    portfolio: [
      "maison-1",
      "maison-2",
      "maison-3",
      "maison-4",
      "maison-5",
      "maison-6",
    ],
    testimonials: [
      {
        name: "Noor Atelier",
        context: "Hospitality campaign",
        quote:
          "They translated our brand into imagery that feels luxurious and timeless. The results were beyond expectations.",
      },
    ],
  },
  "golden-hour-stories": {
    intro:
      "Golden Hour Stories specializes in lifestyle sessions full of warmth, movement, and natural light.",
    experienceYears: 6,
    availability: "Weekends available · Sunset slots in demand",
    services: [
      {
        title: "Lifestyle portrait session",
        description:
          "Relaxed sessions for couples, families, or personal storytelling.",
        duration: "90 minutes",
        startingPrice: 380,
      },
      {
        title: "Mini story session",
        description:
          "Short-form sessions perfect for quick refreshes or seasonal moments.",
        duration: "45 minutes",
        startingPrice: 220,
      },
    ],
    portfolio: [
      "golden-1",
      "golden-2",
      "golden-3",
      "golden-4",
    ],
    testimonials: [
      {
        name: "Sienna R.",
        context: "Family session",
        quote:
          "We felt so comfortable the entire time. The photos feel candid and full of life.",
      },
    ],
  },
  "atelier-coast": {
    intro:
      "Atelier Coast delivers modern fashion editorials with clean composition and a coastal palette.",
    experienceYears: 9,
    availability: "Booking editorials for next month",
    services: [
      {
        title: "Fashion editorial",
        description:
          "Half-day editorial production with styling and art direction support.",
        duration: "5 hours",
        startingPrice: 1800,
      },
      {
        title: "Lookbook session",
        description:
          "Crisp, modern lookbook imagery for fashion labels and boutiques.",
        duration: "3 hours",
        startingPrice: 1100,
      },
    ],
    portfolio: [
      "coast-1",
      "coast-2",
      "coast-3",
      "coast-4",
      "coast-5",
    ],
    testimonials: [
      {
        name: "Marin Studio",
        context: "Lookbook campaign",
        quote:
          "A seamless shoot with elevated results. The imagery feels modern and premium.",
      },
    ],
  },
  "terra-loom": {
    intro:
      "Terra Loom captures adventurous elopements with sweeping landscapes and soulful storytelling.",
    experienceYears: 7,
    availability: "Travel dates open · Custom elopement planning available",
    services: [
      {
        title: "Adventure elopement",
        description:
          "All-day coverage with scouting, timeline planning, and curated preview.",
        duration: "8 hours",
        startingPrice: 2100,
      },
      {
        title: "Engagement story",
        description:
          "Sunrise or sunset storytelling session in a scenic location.",
        duration: "2 hours",
        startingPrice: 650,
      },
    ],
    portfolio: [
      "terra-1",
      "terra-2",
      "terra-3",
      "terra-4",
      "terra-5",
    ],
    testimonials: [
      {
        name: "Lena & Marco",
        context: "Mountain elopement",
        quote:
          "They guided us through every step and captured the most breathtaking images.",
      },
    ],
  },
  "lucent-studio": {
    intro:
      "Lucent Studio creates culinary imagery with crisp lighting, texture, and editorial composition.",
    experienceYears: 11,
    availability: "Weekly production slots open",
    services: [
      {
        title: "Restaurant editorial",
        description:
          "Full service imagery for menus, socials, and brand refreshes.",
        duration: "4 hours",
        startingPrice: 950,
      },
      {
        title: "Product spotlight",
        description:
          "Studio-based sessions for packaged goods and culinary products.",
        duration: "3 hours",
        startingPrice: 780,
      },
    ],
    portfolio: [
      "lucent-1",
      "lucent-2",
      "lucent-3",
      "lucent-4",
    ],
    testimonials: [
      {
        name: "Harbor House",
        context: "Seasonal menu shoot",
        quote:
          "The photos elevated our menu instantly. Every dish looks artful and inviting.",
      },
    ],
  },
  "haven-frames": {
    intro:
      "Haven Frames specializes in relaxed family portraiture with warm, natural light.",
    experienceYears: 5,
    availability: "Weekends booking fast · Weekday mornings open",
    services: [
      {
        title: "Family portrait",
        description:
          "Lifestyle family sessions in-home or outdoors with gentle direction.",
        duration: "90 minutes",
        startingPrice: 320,
      },
      {
        title: "Newborn story",
        description:
          "Soft, intimate newborn sessions with a documentary approach.",
        duration: "2 hours",
        startingPrice: 420,
      },
    ],
    portfolio: [
      "haven-1",
      "haven-2",
      "haven-3",
      "haven-4",
    ],
    testimonials: [
      {
        name: "The Martins",
        context: "Family session",
        quote:
          "Warm and relaxed from start to finish. The images feel like home.",
      },
    ],
  },
  "solstice-atelier": {
    intro:
      "Solstice Atelier delivers fine-art portraiture with sculpted light and painterly tones.",
    experienceYears: 9,
    availability: "Studio sessions available monthly",
    services: [
      {
        title: "Fine art portrait",
        description:
          "Studio portrait session with curated lighting, styling, and retouching.",
        duration: "2 hours",
        startingPrice: 980,
      },
      {
        title: "Creative collaboration",
        description:
          "Concept-driven sessions for artists and designers.",
        duration: "3 hours",
        startingPrice: 1250,
      },
    ],
    portfolio: [
      "solstice-1",
      "solstice-2",
      "solstice-3",
      "solstice-4",
      "solstice-5",
    ],
    testimonials: [
      {
        name: "Alina C.",
        context: "Creative portrait",
        quote:
          "Every detail felt considered. The final images are museum-quality.",
      },
    ],
  },
  "brassline-studio": {
    intro:
      "Brassline Studio crafts polished corporate imagery for teams and leadership.",
    experienceYears: 8,
    availability: "Next availability in two weeks",
    services: [
      {
        title: "Executive portrait day",
        description:
          "On-site studio setup for leadership and executive portraits.",
        duration: "3 hours",
        startingPrice: 1050,
      },
      {
        title: "Team culture story",
        description:
          "Brand storytelling sessions for teams, offices, and events.",
        duration: "4 hours",
        startingPrice: 1350,
      },
    ],
    portfolio: [
      "brassline-1",
      "brassline-2",
      "brassline-3",
      "brassline-4",
    ],
    testimonials: [
      {
        name: "Summit Labs",
        context: "Leadership portraits",
        quote:
          "We felt confident on set and received polished images for our entire team.",
      },
    ],
  },
};

export const getPhotographerDetail = (id: string): PhotographerDetail | null => {
  const base = mockPhotographers.find((photographer) => photographer.id === id);
  if (!base) return null;
  const extras = detailExtras[id];
  if (!extras) return null;

  return {
    ...base,
    ...extras,
  };
};
