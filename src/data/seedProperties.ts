import heroVillaImg from '../assets/images/hero_modern_villa_1791042050564.jpg';
import mapleHouseImg from '../assets/images/property_maple_house_1791042065252.jpg';
import oakEstateImg from '../assets/images/property_oak_estate_1791042078474.jpg';
import pineApartmentImg from '../assets/images/property_pine_apartment_1791042089462.jpg';
import oceanVillaImg from '../assets/images/property_ocean_villa_1791042100265.jpg';
import scenicPlotImg from '../assets/images/property_scenic_plot_1791042112207.jpg';
import valuationBannerImg from '../assets/images/valuation_interior_banner_1791042123977.jpg';
import { Property } from '../types/realEstate';

export const BRAND_IMAGES = {
  heroVilla: heroVillaImg,
  valuationBanner: valuationBannerImg,
  presets: [
    { label: 'Contemporary Villa', url: mapleHouseImg },
    { label: 'Stone & Timber Estate', url: oakEstateImg },
    { label: 'High-Rise Residence', url: pineApartmentImg },
    { label: 'Coastal Infinity Villa', url: oceanVillaImg },
    { label: 'Scenic Hillside Plot', url: scenicPlotImg },
    { label: 'Twilight Glass Estate', url: heroVillaImg },
  ],
};

export const INITIAL_SEED_PROPERTIES: Property[] = [
  {
    id: 'prop_maple_drive_101',
    ownerId: 'system_homeluxe_agency',
    ownerName: 'Victoria Sterling · Senior Partner',
    name: '123 Maple Drive',
    image: mapleHouseImg,
    price: 850000,
    location: 'Beverly Hills, CA 90210',
    category: 'House',
    bedrooms: 4,
    bathrooms: 3,
    area: 2450,
    description:
      'Architectural two-story contemporary residence featuring floor-to-ceiling low-iron glass walls, a cantilevered roofline, chef-grade walnut kitchen with Gaggenau appliances, and seamless indoor-outdoor entertaining terraces.',
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    id: 'prop_oak_avenue_102',
    ownerId: 'system_homeluxe_agency',
    ownerName: 'Marcus Vance · Principal Broker',
    name: '456 Oak Avenue',
    image: oakEstateImg,
    price: 620000,
    location: 'Austin, TX 78701',
    category: 'House',
    bedrooms: 3,
    bathrooms: 2,
    area: 1890,
    description:
      'Warm limestone and cedar family estate nestled on a tree-lined avenue in central Austin. Offers vaulted Douglas fir ceilings, a custom hearth, private study, two-car architectural garage, and mature drought-tolerant landscaping.',
    createdAt: '2026-09-20T14:30:00.000Z',
    updatedAt: '2026-09-20T14:30:00.000Z',
  },
  {
    id: 'prop_pine_street_103',
    ownerId: 'system_homeluxe_agency',
    ownerName: 'Elena Rostova · Luxury Condominiums',
    name: '789 Pine Street, Unit 5B',
    image: pineApartmentImg,
    price: 485000,
    location: 'Miami, FL 33101',
    category: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    description:
      'Sun-drenched corner sky residence with wrap-around glass balcony overlooking a resort-style palm pool deck. Includes private elevator vestibule, Italian porcelain flooring, smart climate automation, and 24-hour concierge.',
    createdAt: '2026-09-22T09:15:00.000Z',
    updatedAt: '2026-09-22T09:15:00.000Z',
  },
  {
    id: 'prop_ocean_view_104',
    ownerId: 'system_homeluxe_agency',
    ownerName: 'Victoria Sterling · Senior Partner',
    name: '321 Ocean View Drive',
    image: oceanVillaImg,
    price: 1250000,
    location: 'San Diego, CA 92101',
    category: 'House',
    bedrooms: 4,
    bathrooms: 4,
    area: 3100,
    description:
      'Coastal sanctuary perched above the Pacific shoreline with a zero-edge heated infinity pool, sunset lounge deck, temperature-controlled wine gallery, and primary suite with panoramic ocean horizon views.',
    createdAt: '2026-09-25T16:45:00.000Z',
    updatedAt: '2026-09-25T16:45:00.000Z',
  },
  {
    id: 'prop_horizon_plot_105',
    ownerId: 'system_homeluxe_agency',
    ownerName: 'Arthur Pendelton · Land & Estates',
    name: '890 Horizon Ridge Parcel',
    image: scenicPlotImg,
    price: 390000,
    location: 'Malibu, CA 90265',
    category: 'Plot',
    bedrooms: 0,
    bathrooms: 0,
    area: 14500,
    description:
      'Fully surveyed residential hillside building plot with unobstructed canyon and coastal views. Geotechnical soil report completed, underground utilities at boundary, and approved conceptual grading for a custom modern estate.',
    createdAt: '2026-09-28T11:20:00.000Z',
    updatedAt: '2026-09-28T11:20:00.000Z',
  },
  {
    id: 'prop_bayfront_apt_106',
    ownerId: 'system_homeluxe_agency',
    ownerName: 'Elena Rostova · Luxury Condominiums',
    name: '550 Bayfront Terrace, PH-2',
    image: valuationBannerImg,
    price: 940000,
    location: 'San Francisco, CA 94105',
    category: 'Apartment',
    bedrooms: 3,
    bathrooms: 3,
    area: 2150,
    description:
      'Penthouse residence showcasing 11-foot floor-to-ceiling skyline windows, bespoke oak millwork, private terrace, acoustic glazing, and two dedicated EV valet spaces in a premier full-service tower.',
    createdAt: '2026-10-01T08:00:00.000Z',
    updatedAt: '2026-10-01T08:00:00.000Z',
  },
];
