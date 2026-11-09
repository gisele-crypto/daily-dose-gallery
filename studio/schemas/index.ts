import { artist } from "./artist";
import { artwork } from "./artwork";
import { about, contact, gallery, home, privacy } from "./pages";

export const schemaTypes = [artwork, artist, home, about, contact, privacy, gallery];

/** One-of-a-kind documents with a fixed id. */
export const singletons = [
  { type: "home", id: "home", title: "Homepage" },
  { type: "about", id: "about", title: "About" },
  { type: "contact", id: "contact", title: "Contact" },
  { type: "privacy", id: "privacy", title: "Privacyverklaring" },
  { type: "gallery", id: "gallery", title: "Galeriegegevens" },
];
