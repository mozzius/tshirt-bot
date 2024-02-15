import { createImage } from "./image";

const main = async () => {
  const image =
    "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:p2cp5gopk7mgjegy6wadk3ep/bafkreifxommczcktxe77or6whboxj3cpeealoy7bcr4xorwitfd22z5ukm@jpeg";
  const merged = await createImage(image);
  merged.toFile("merged.png");
};

main();
