import type { Metadata } from "next";
import ProductWebsite from "@/components/marketing/product-website";

export const metadata: Metadata = {
  title: "Lactic — Your training. Connected.",
  description:
    "Your programme, every set, your progress. Discover Lactic for athletes and Lactic Studio for coaches. Start coaching on the web with up to 3 clients for free.",
  icons: { icon: "/lactic-icon.svg" },
};

export default function Home() {
  return <ProductWebsite />;
}
