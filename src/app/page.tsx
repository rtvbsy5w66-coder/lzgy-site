import HeroSlider from "@/components/slider/HeroSlider";
import ClientPage from "@/components/sections/ClientPage";
import { Slide } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Kezdőlap - Lovas Zoltán György",
  description:
    "Mindenki Magyarországa Néppárt - Lovas Zoltán György hivatalos weboldala",
};

async function getActiveSlides(): Promise<Slide[]> {
  try {
    const slides = await prisma.slide.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });
    return slides;
  } catch (error) {
    console.error("Error fetching slides:", error);
    return [];
  }
}

export default async function Home() {
  const slides = await getActiveSlides();
  return <ClientPage slides={slides} />;
}
