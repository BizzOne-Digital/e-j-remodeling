import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBar } from "@/components/layout/mobile-bar";
import { JsonLd } from "@/components/shared/json-ld";
import { getSite } from "@/lib/content";
import { siteUrl } from "@/lib/utils";

export const revalidate = 600;
export default async function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const { settings: s, services } = await getSite();
  const links = services.map(({ title, slug }) => ({ title, slug }));
  const sameAs = Object.values(s.social).filter(Boolean);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-5 focus:py-3 focus:font-semibold focus:text-dark">Skip to main content</a>
      <Header settings={s} services={links} />
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      <Footer settings={s} services={links} />
      <MobileBar phone={s.phone} />
      <JsonLd data={{
        "@type": "HomeAndConstructionBusiness", "@id": siteUrl() + "/#business", name: s.businessName, url: siteUrl(), telephone: s.phone, email: s.email,
        logo: siteUrl() + s.logoImage, image: siteUrl() + s.seo.shareImage,
        ...(s.businessAddress && { address: s.businessAddress }), ...(s.serviceAreas && { areaServed: s.serviceAreas }), ...(sameAs.length && { sameAs }),
        hasOfferCatalog: { "@type": "OfferCatalog", name: "Remodeling services", itemListElement: services.map((v) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: v.title, description: v.shortDescription } })) },
      }} />
    </>
  );
}
