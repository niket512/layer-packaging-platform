import type { BoxType } from "@/lib/box-enquiry";
import corrugated160 from "@/assets/box-styles/corrugated-160.webp.asset.json";
import corrugated320 from "@/assets/box-styles/corrugated-320.webp.asset.json";
import mailer160 from "@/assets/box-styles/mailer-160.webp.asset.json";
import mailer320 from "@/assets/box-styles/mailer-320.webp.asset.json";
import product160 from "@/assets/box-styles/product-160.webp.asset.json";
import product320 from "@/assets/box-styles/product-320.webp.asset.json";
import rigid160 from "@/assets/box-styles/rigid-160.webp.asset.json";
import rigid320 from "@/assets/box-styles/rigid-320.webp.asset.json";
import display160 from "@/assets/box-styles/display-160.webp.asset.json";
import display320 from "@/assets/box-styles/display-320.webp.asset.json";
import gift160 from "@/assets/box-styles/gift-160.webp.asset.json";
import gift320 from "@/assets/box-styles/gift-320.webp.asset.json";

/** First-screen photos use only their small CDN pointers, not the full catalogue map. */
export const BOX_STYLE_IMAGES: Partial<Record<BoxType, { src: string; srcSet: string }>> = {
  corrugated: { src: corrugated160.url, srcSet: `${corrugated160.url} 160w, ${corrugated320.url} 320w` },
  mailer: { src: mailer160.url, srcSet: `${mailer160.url} 160w, ${mailer320.url} 320w` },
  product: { src: product160.url, srcSet: `${product160.url} 160w, ${product320.url} 320w` },
  rigid: { src: rigid160.url, srcSet: `${rigid160.url} 160w, ${rigid320.url} 320w` },
  display: { src: display160.url, srcSet: `${display160.url} 160w, ${display320.url} 320w` },
  gift: { src: gift160.url, srcSet: `${gift160.url} 160w, ${gift320.url} 320w` },
};
