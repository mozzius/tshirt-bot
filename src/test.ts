import { AppBskyEmbedExternal, BlobRef, BskyAgent } from "@atproto/api";
import { createImage } from "./image";

import "dotenv/config";

const agent = new BskyAgent({
  service: "https://bsky.social",
});

const main = async () => {
  await agent.login({
    identifier: process.env.BOT_HANDLE!,
    password: process.env.BOT_PASSWORD!,
  });
  const image =
    "https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:p2cp5gopk7mgjegy6wadk3ep/bafkreifxommczcktxe77or6whboxj3cpeealoy7bcr4xorwitfd22z5ukm@jpeg";
  const merged = await createImage(image);
  merged.toFile("merged.png");
  const uploadRes = await fetch(
    "https://bsky.social/xrpc/com.atproto.repo.uploadBlob",
    {
      method: "POST",
      body: await merged.toBuffer(),
      headers: {
        "Content-Type": "image/jpeg",
        Authorization: `Bearer ${agent.session!.accessJwt}`,
      },
    }
  );

  const { blob } = (await uploadRes.json()) as { blob: BlobRef };

  await agent.post({
    langs: ["en"],
    text: "test pls ignore",
    embed: {
      $type: "app.bsky.embed.external",
      external: {
        thumb: blob,
        uri: `https://tshirt.mozzius.dev?design=${encodeURIComponent(image)}`,
        title: "Buy the tshirt here!!!!",
        description: "hand crafted just for u :)",
      } satisfies AppBskyEmbedExternal.External,
    },
  });
};

main();
