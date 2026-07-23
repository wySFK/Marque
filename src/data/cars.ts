import car2 from "@/assets/car-2.jpg";
import mclaren from "@/assets/mclaren.jpg";
import lambhorgini from "@/assets/lambhorgini.jpg";
import fordGT from "@/assets/fordGT.jpg";
import ford from "@/assets/ford.jpg";
import alfaromeo from "@/assets/alfaromeo.jpg";
import koenigsegg from "@/assets/koenigsegg.jpg";
import porschee from "@/assets/porschee.jpg";
import porsche from "@/assets/porsche.jpg";
import lotus from "@/assets/Lotus.jpg";
import mercedes from "@/assets/mercedes.jpg";
import ferrari from "@/assets/ferrari.jpg";

export type CarStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export type CarListing = {
  id: string;
  name: string;
  year: number;
  engine: string;
  hp: number;
  price: number;
  mileage: number;
  location: string;
  category: string;
  image: string;
  status: CarStatus;
  provenance: string;
  dealer: string;
  dealerResponseTime: string;
};

export const catalog: CarListing[] = [
  { id: "mclaren-p1-gtr", name: "McLaren P1 GTR", year: 2016, engine: "3.8L Twin-Turbo V8 Hybrid", hp: 986, price: 3200000, mileage: 180, location: "Woking, UK", category: "Supercar", image: mclaren, status: "AVAILABLE", provenance: "One of 58 track-only P1 GTRs built. Never raced, delivered new to its sole prior owner in Woking. Retains factory P1 GTR specification with the track pack and data-logging system.", dealer: "Marque Motors Woking", dealerResponseTime: "~2 hrs" },
  { id: "zephyr-v", name: "Rimac Nevera", year: 2023, engine: "EV Dual-Motor", hp: 740, price: 2200000, mileage: 4800, location: "Oslo, NO", category: "Electric", image: car2, status: "AVAILABLE", provenance: "One of only 150 Neveras produced. Delivered new to Norway with full PPF from delivery. Regularly serviced at Rimac Zagreb. All original books and charging equipment included.", dealer: "Nordic E-Motive", dealerResponseTime: "~4 hrs" },
  { id: "lamborghini-huracan-sto", name: "Lamborghini Huracán STO", year: 2023, engine: "5.2L V10", hp: 631, price: 360000, mileage: 850, location: "Sant'Agata Bolognese, IT", category: "Supercar", image: lambhorgini, status: "RESERVED", provenance: "Delivery-mileage STO finished in Blu Glauco over black Alcantara. Optioned with the carbon fiber pack, titanium exhaust, and telemetry system. Serviced at the factory in February 2026.", dealer: "Automobili Lamborghini Certified", dealerResponseTime: "~1 hr" },
  { id: "alfa-romeo-4c", name: "Alfa Romeo 4C", year: 2018, engine: "1.75L Turbo Inline-4", hp: 237, price: 72000, mileage: 16500, location: "Turin, IT", category: "Sports", image: alfaromeo, status: "AVAILABLE", provenance: "One-owner 4C in Rosso Competizione over tan leather. Regularly maintained at an Alfa Romeo specialist. Includes the rare carbon fiber monocoque and Akrapovic exhaust option.", dealer: "Torino Classiche", dealerResponseTime: "~3 hrs" },
  { id: "porsche-911-gt3-rs", name: "Porsche 911 GT3 RS", year: 2016, engine: "4.0L Flat-6", hp: 500, price: 245000, mileage: 8900, location: "Stuttgart, DE", category: "Sports", image: porschee, status: "AVAILABLE", provenance: "Low-mileage 991.1 GT3 RS finished in Miami Blue over black leather and Alcantara. Equipped with the Weissach package, front axle lift, and factory navigation. Full Porsche service history.", dealer: "Stuttgart Performance Group", dealerResponseTime: "~2 hrs" },
  { id: "ford-mustang-1967", name: "Ford Mustang", year: 1967, engine: "4.7L V8 (289ci)", hp: 225, price: 65000, mileage: 42000, location: "Netherlands", category: "Classic", image: ford, status: "AVAILABLE", provenance: "A numbers-matching 1967 Mustang coupe finished in Acapulco Blue. Older restoration with correct drivetrain, interior, and trim. Retains original build sheet and owner history since 1968.", dealer: "Dutch Classic Motor Co.", dealerResponseTime: "~5 hrs" },
  { id: "bentley-ct-gt", name: "Ford GT", year: 2017, engine: "5.0L V8", hp: 435, price: 34900, mileage: 42000, location: "TEXAS, USA", category: "GT", image: fordGT, status: "AVAILABLE", provenance: "Well-maintained second-generation Ford GT in Triple Yellow. One of 500 produced for the 2017 model year. Equipped with the carbon fiber wheel option and painted brake calipers. Clean Carfax.", dealer: "Lone Star Motors", dealerResponseTime: "~1 hr" },
  { id: "mercedes-amg-gt-black-series", name: "Mercedes-AMG GT Black Series", year: 2021, engine: "4.0L Twin-Turbo V8", hp: 720, price: 395000, mileage: 1800, location: "Affalterbach, DE", category: "Supercar", image: mercedes, status: "AVAILABLE", provenance: "Shadow Matte Grey example with 1,800 original kilometers. Optioned with the AMG Track Package and carbon ceramic brakes. Maintained exclusively at Mercedes-AMG Affalterbach. Complete with factory cover and delivery documents.", dealer: "AMG Private Collection", dealerResponseTime: "~2 hrs" },
  { id: "koenigsegg-jesko-attack", name: "Koenigsegg Jesko Attack", year: 2023, engine: "5.0L Twin-Turbo V8", hp: 1600, price: 320000, mileage: 180, location: "Ängelholm, SE", category: "Supercar", image: koenigsegg, status: "AVAILABLE", provenance: "Pre-delivery Jesko Attack in raw carbon with gold leaf accents. One of the first customer examples produced. Never titled. Factory delivery available at the Ängelholm facility with full orientation.", dealer: "Koenigsegg Direct", dealerResponseTime: "~6 hrs" },
  { id: "lotus-evija", name: "Lotus Evija", year: 2022, engine: "Quad-Motor Electric", hp: 1972, price: 2100000, mileage: 450, location: "Hethel, UK", category: "Hypercar", image: lotus, status: "AVAILABLE", provenance: "Chassis 17 of 130 Evijas produced. Finished in Atomic Yellow over black interior. Development-mule software updated to final production spec. Includes the full liquid-cooled battery system and active rear wing.", dealer: "Lotus Heritage Hethel", dealerResponseTime: "~3 hrs" },
  { id: "ferrari-812-competizione", name: "Ferrari 812 Competizione", year: 2022, engine: "6.5L Naturally Aspirated V12", hp: 819, price: 1650000, mileage: 980, location: "Maranello, IT", category: "GT", image: ferrari, status: "AVAILABLE", provenance: "One of 999 Competizione coupes built. Rosso Corsa over black Alcantara with the full carbon fiber exterior package. Ferrari Classiche certified. Original MSRP was over €750,000.", dealer: "Ferrari Classiche Maranello", dealerResponseTime: "~1 hr" },
  { id: "porsche-718-spyder", name: "Porsche 718 Spyder", year: 2020, engine: "4.0L Flat-6", hp: 414, price: 118000, mileage: 12800, location: "Stuttgart, DE", category: "Sports", image: porsche, status: "AVAILABLE", provenance: "GT Silver Metallic 718 Spyder with the optional two-tone leather interior and extended leather package. Upgraded with the sports exhaust and adaptive sport seats. Full Porsche maintenance records.", dealer: "Porsche Zentrum Stuttgart", dealerResponseTime: "~2 hrs" },
];

export function fmtPrice(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
