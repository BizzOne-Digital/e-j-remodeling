import type { ICON_KEYS } from "./constants";

export const defaultSettings = {
  businessName: "E&J Kitchen and Bathroom Remodeling, LLC",
  contactPerson: "Jim Vaccola",
  phone: "570-656-2154",
  email: "jimvaccola@aol.com",
  logoImage: "/images/logo.png",
  topBarText: "Free Estimates",
  businessHours: "",
  businessAddress: "",
  serviceAreas: "",
  showMap: false,
  footerText: "Quality kitchen and bathroom remodeling built around honesty, reliability, and attention to detail.",
  tagline: "Trustworthy. Honest. Reliable.",
  consultationLabel: "Book a Consultation",
  estimateLabel: "Request a Free Estimate",
  social: { facebookUrl: "", instagramUrl: "", googleUrl: "", houzzUrl: "", linkedinUrl: "" },
  seo: {
    homeTitle: "E&J Kitchen and Bathroom Remodeling, LLC | Free Remodeling Estimates",
    homeDescription: "Transform your home with E&J Kitchen and Bathroom Remodeling, LLC. Explore electrical, plumbing, drywall, cabinets, showers, and flooring services. Request a free estimate today.",
    servicesTitle: "Kitchen & Bathroom Remodeling Services | E&J Remodeling",
    servicesDescription: "Electrical, plumbing, drywall, cabinets, showers, and floors. See how E&J can help with your kitchen, bathroom, or individual home improvement.",
    testimonialsTitle: "Customer Testimonials | E&J Remodeling",
    testimonialsDescription: "Read approved feedback from E&J Kitchen and Bathroom Remodeling customers, or share your own remodeling experience.",
    bookingTitle: "Book a Remodeling Consultation | E&J Remodeling",
    bookingDescription: "Request a consultation or a free estimate for your kitchen, bathroom, or home improvement project with E&J Kitchen and Bathroom Remodeling, LLC.",
    contactTitle: "Contact E&J Kitchen and Bathroom Remodeling, LLC",
    contactDescription: "Call Jim Vaccola at 570-656-2154 or send a message to discuss your next kitchen or bathroom remodeling project.",
    shareImage: "/images/og-image.webp",
  },
};
export type Settings = typeof defaultSettings;

const t = (title: string, text: string) => ({ title, text });
export const defaultHome = {
  sections: { services: true, about: true, transformations: true, whyChooseUs: true, gallery: true, process: true, testimonials: true, faq: true, cta: true },
  hero: {
    eyebrow: "REMODEL • UPGRADE • TRANSFORM",
    highlight: "E&J",
    heading: "Kitchen and Bathroom Remodeling, LLC",
    description: "Quality remodeling services to make your home more beautiful, functional, and valuable.",
    primaryButton: "Request a Free Estimate",
    secondaryButton: "Book a Consultation",
    trustIndicators: ["Trustworthy", "Honest", "Reliable"],
    desktopImage: "/images/hero-kitchen.webp",
    mobileImage: "/images/hero-mobile.webp",
  },
  services: {
    headingStart: "Our", headingHighlight: "Remodeling", headingEnd: "Services",
    description: "From essential home improvements to complete kitchen and bathroom transformations, we help bring your vision to life.",
  },
  about: {
    eyebrow: "ABOUT E&J REMODELING",
    heading: "Transforming Houses Into Homes You'll Love",
    paragraphs: [
      "At E&J Kitchen and Bathroom Remodeling, LLC, we believe every homeowner deserves a space that is beautiful, practical, and comfortable. Our approach is built around honesty, reliability, and attention to detail.",
      "Whether you are planning a kitchen upgrade, bathroom renovation, or individual home improvements, we are here to help bring your ideas to life.",
    ],
    checklist: ["Personalized Remodeling Solutions", "Clear Communication", "Attention to Detail", "Functional and Beautiful Designs", "Free Estimates"],
    button: "Get Your Free Estimate",
    image: "/images/about-remodeling.webp",
  },
  transformations: {
    heading: "Kitchen and Bathroom Transformations",
    kitchen: { title: "Kitchen Remodeling", text: "Create a kitchen that combines functionality, comfort, and timeless design.", button: "Explore Kitchen Improvements", image: "/images/kitchen-feature.webp" },
    bathroom: { title: "Bathroom Remodeling", text: "Turn your bathroom into a relaxing, practical, and beautifully finished space.", button: "Explore Bathroom Improvements", image: "/images/bathroom-feature.webp" },
  },
  whyChooseUs: {
    heading: "Built on Trust. Focused on Quality.",
    description: "The values behind every conversation, estimate, and improvement.",
    items: [
      t("Trustworthy Service", "Your home is personal. We treat it, and your trust, with care."),
      t("Honest Communication", "Straightforward answers so you always know where things stand."),
      t("Reliable Work", "We follow through on what we agree to do."),
      t("Attention to Detail", "Careful work on the finishing touches you notice every day."),
      t("Personalized Solutions", "Improvements shaped around how you use your home."),
      t("Free Estimates", "Talk through your project and request an estimate at no charge."),
    ],
  },
  gallery: { heading: "Imagine the Possibilities for Your Home", description: "Browse ideas for your next kitchen, bathroom, or home improvement." },
  process: {
    heading: "Our Remodeling Process",
    description: "Four clear steps from first conversation to finished space.",
    steps: [
      t("Get in Touch", "Tell us about your home improvement needs."),
      t("Consultation and Estimate", "Discuss your vision and request an estimate."),
      t("Project Planning", "Review the proposed improvements, materials, and project details."),
      t("Transform Your Space", "Move forward with the agreed remodeling work."),
    ],
  },
  testimonials: { heading: "What Homeowners Say", emptyTitle: "Worked with E&J?", emptyText: "We would love to hear how your project went. Share your experience to help other homeowners." },
  faq: { heading: "Frequently Asked Questions", description: "Quick answers about services, estimates, and payments." },
  cta: {
    heading: "Ready to Transform Your Home?",
    description: "Take the first step toward creating a space that works beautifully for your lifestyle. Contact E&J Kitchen and Bathroom Remodeling, LLC to discuss your next project.",
    button: "Request a Free Estimate",
    image: "/images/cta-background.webp",
  },
  pages: {
    services: { heading: "Professional Remodeling Services", description: "Individual improvements or a complete transformation. Pricing depends on your project, so contact us for a free estimate.", image: "/images/services-banner.webp" },
    testimonials: { heading: "Trusted by Homeowners", description: "Discover feedback from customers who have worked with E&J Kitchen and Bathroom Remodeling, LLC.", image: "/images/testimonials-banner.webp" },
    booking: { heading: "Book Your Remodeling Consultation", description: "Tell us about your remodeling project and let us help you take the next step toward your ideal home.", image: "/images/booking-banner.webp" },
    contact: { heading: "Let's Discuss Your Next Project", description: "Questions, ideas, or ready to get started? Reach out by phone, email, or the form below.", image: "/images/contact-banner.webp" },
  },
};
export type HomeContent = typeof defaultHome;

export type ServiceItem = {
  title: string; slug: string; shortDescription: string; description: string;
  icon: (typeof ICON_KEYS)[number]; image: string; benefits: string[]; options: string[]; order: number; published: boolean;
};
const svc = (order: number, slug: ServiceItem["icon"], title: string, shortDescription: string, description: string, benefits: string[], options: string[]): ServiceItem =>
  ({ order, slug, icon: slug, title, shortDescription, description, benefits, options, image: `/images/service-${slug}.webp`, published: true });

export const defaultServices: ServiceItem[] = [
  svc(0, "electrical", "Electrical", "Electrical improvements designed to support functional, comfortable, and modern living spaces.",
    "Good lighting and well-placed power change how a room works. We help you plan electrical improvements as part of a kitchen or bathroom remodel, so task lighting, outlets, and fixtures suit the way you use the space.",
    ["Brighter, more usable work areas", "Outlets placed where you need them", "Fixtures that match your finishes"], ["Lighting fixtures", "Under-cabinet lighting", "Outlets and switches", "Bathroom ventilation"]),
  svc(1, "plumbing", "Plumbing", "Plumbing solutions for kitchen and bathroom remodeling, including fixtures, sinks, faucets, and related improvements.",
    "From a new faucet to a reworked bathroom layout, plumbing is at the heart of most remodels. We coordinate fixtures, sinks, and connections with the rest of your project so everything fits and functions together.",
    ["Updated, easy-to-use fixtures", "Layouts planned around daily routines", "Coordinated with your wider remodel"], ["Faucets and sinks", "Toilets and vanities", "Tubs", "Kitchen fixtures"]),
  svc(2, "drywall", "Drywall", "Professional drywall installation, repair, and finishing for clean, smooth interior surfaces.",
    "Smooth walls and ceilings give every finished room its polish. We install, repair, and finish drywall so surfaces are ready for paint, tile, and trim.",
    ["Clean, even surfaces", "Repairs that blend in", "Ready for paint and trim"], ["New drywall", "Patching and repair", "Taping and finishing", "Ceilings"]),
  svc(3, "cabinets", "Cabinets", "Transform your kitchen or bathroom with attractive, functional cabinetry and improved storage solutions.",
    "Cabinets set the tone for a kitchen or bathroom and decide how much you can store. We help you choose styles, finishes, and layouts that look right and keep everyday items within reach.",
    ["More practical storage", "Styles and finishes to suit your home", "A layout that improves workflow"], ["Kitchen cabinets", "Bathroom vanities", "Islands and pantries", "Hardware updates"]),
  svc(4, "showers", "Showers", "Upgrade your bathroom with beautifully designed showers, modern finishes, and practical layouts.",
    "A well-planned shower makes the whole bathroom feel new. We work with you on layout, tile, glass, and fixtures to create a shower that is comfortable to use and easy to live with.",
    ["Comfortable, practical layouts", "Modern tile and glass finishes", "Fixtures chosen for your routine"], ["Tile showers", "Glass enclosures", "Tub-to-shower updates", "Niches and seating"]),
  svc(5, "floors", "Floors", "Improve your home's appearance and functionality with professionally installed flooring.",
    "New flooring ties a room together and stands up to daily life. We help you compare materials for kitchens, bathrooms, and living areas, then install them with careful attention to transitions and edges.",
    ["Materials suited to each room", "Neat transitions and edges", "A refreshed look throughout"], ["Tile", "Hardwood", "Laminate", "Vinyl plank"]),
];

export type FaqItem = { question: string; answer: string; order: number; published: boolean };
export const defaultFaqs: FaqItem[] = [
  ["What remodeling services do you offer?", "We offer electrical, plumbing, drywall, cabinets, showers, and flooring services for kitchen and bathroom remodeling and other home improvements."],
  ["Do you provide free estimates?", "Yes. Send us your project details through the booking form or call us to request a free estimate."],
  ["How can I book a consultation?", "Complete the form on our Booking page with your preferred date and time. Your request is reviewed first, and we contact you to confirm the appointment."],
  ["Can I request individual remodeling services?", "Yes. You can request a single service, such as a new shower or flooring, or combine several services in one project."],
  ["How much will my remodeling project cost?", "Every project is different. Cost depends on the confirmed scope, materials, and condition of the space, so we provide an estimate after discussing your project."],
  ["How long does a remodeling project take?", "Timelines depend on the confirmed scope of work and materials. We discuss the expected schedule with you during project planning."],
  ["How can I make a payment?", "Once an amount has been agreed, we can send you a payment request with a secure link. Card details are handled by the payment provider and are never stored on this website."],
].map(([question, answer], order) => ({ question, answer, order, published: true }));

export type GalleryItem = {
  title: string; description: string; category: string; kind: "inspiration" | "project";
  image: string; beforeImage: string; afterImage: string; video: string; order: number; published: boolean;
};
/** Genuine E&J work supplied by the client. */
export const projectGallery: GalleryItem[] = ([
  ["Walk-in shower with glass enclosure and rain head", "Showers", "shower-05", ""],
  ["Tiled shower with bench and dark fixtures", "Showers", "shower-04", ""],
  ["Glass shower with half wall", "Showers", "shower-02", ""],
  ["Accessible shower with grab bars and fold-down seat", "Showers", "shower-01", ""],
  ["Wood-look tile shower with niche", "Showers", "shower-03", ""],
  ["Gray shaker kitchen with granite counters", "Kitchens", "kitchen-03", ""],
  ["Gray cabinet kitchen with stainless appliances", "Kitchens", "kitchen-01", ""],
  ["Kitchen cabinetry opening to the dining area", "Kitchens", "kitchen-02", ""],
  ["Subway tile bathroom walkthrough", "Bathrooms", "bathroom-video-poster", "/videos/bathroom-01.mp4"],
] as const).map(([title, category, f, video], i) => ({ title, description: "", category, kind: "project", image: `/images/projects/${f}.webp`, beforeImage: "", afterImage: "", video, order: i - 100, published: true }));

const inspiration: GalleryItem[] = ([
  ["Bright kitchen with central island", "Kitchens", "gallery-kitchen-01"],
  ["Freestanding tub and vessel sink", "Bathrooms", "gallery-bathroom-01"],
  ["Kitchen island with globe pendants", "Kitchens", "gallery-kitchen-02"],
  ["Warm gray cabinetry and stone counters", "Cabinets", "gallery-cabinets"],
  ["Walk-in shower with double vanity", "Showers", "gallery-shower"],
  ["Marble-look vanity wall", "Bathrooms", "gallery-bathroom-02"],
  ["Light wood floors in an open living area", "Flooring", "gallery-flooring"],
] as const).map(([title, category, f], order) => ({ title, description: "", category, kind: "inspiration", image: `/images/${f}.webp`, beforeImage: "", afterImage: "", video: "", order, published: true }));
export const defaultGallery: GalleryItem[] = [...projectGallery, ...inspiration];

export const defaultAvailability = {
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  timeSlots: ["Morning", "Afternoon", "Evening", "Flexible"],
  blockedDates: [] as string[],
  leadDays: 1,
  maxDaysAhead: 120,
  timeZone: "America/New_York",
};
export type Availability = typeof defaultAvailability;
