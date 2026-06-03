export interface HomeDemoImage {
    src: string;
    alt: string;
    label: string;
    style: string;
}

export const homeDemoImages: HomeDemoImage[] = [
    {
        src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        alt: "Wedding couple walking outdoors",
        label: "Wedding editorial",
        style: "Cinematic",
    },
    {
        src: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
        alt: "Fashion portrait session",
        label: "Fashion portrait",
        style: "Editorial",
    },
    {
        src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
        alt: "Styled food photography table",
        label: "Food styling",
        style: "Warm natural",
    },
    {
        src: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80",
        alt: "Street lifestyle photography scene",
        label: "Street lifestyle",
        style: "Urban",
    },
    {
        src: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80",
        alt: "Portrait photography session",
        label: "Portrait",
        style: "Clean portrait",
    },
];

export const getHomeDemoImage = (index: number): HomeDemoImage => {
    return homeDemoImages[index % homeDemoImages.length] ?? homeDemoImages[0];
};
