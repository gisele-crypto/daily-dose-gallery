import type { Img } from "./types";

/** Props for <Picture>/<getImage> for a local or remote image. */
export function srcProps(img: Img) {
  return "format" in img
    ? { src: img }
    : { src: img.src, width: img.width, height: img.height };
}
