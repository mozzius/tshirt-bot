import { BskyBot, Events } from "easy-bsky-bot-sdk";
import "dotenv/config";
import {
  AppBskyEmbedExternal,
  AppBskyEmbedImages,
  AppBskyEmbedRecordWithMedia,
  AppBskyFeedDefs,
  AppBskyFeedPost,
  BskyAgent,
  ComAtprotoRepoStrongRef,
} from "@atproto/api";

const agent = new BskyAgent({
  service: "https://bsky.social",
});

async function main() {
  const handle = process.env.BOT_HANDLE;
  if (!handle) throw new Error("BOT_HANDLE not set in .env");
  const password = process.env.BOT_PASSWORD;
  if (!password) throw new Error("BOT_PASSWORD not set in .env");

  BskyBot.setOwner({
    handle: "mozzius.dev",
    contact: "mozzius@protonmail.com",
  });

  const bot = new BskyBot({
    handle: handle,
  });

  await bot.login(password);
  await agent.login({
    identifier: handle,
    password: password,
  });

  bot.setHandler(Events.MENTION, async (event) => {
    const { post } = event;
    console.log(`got mention from ${post.author.handle}: ${post.text}`);
    await bot.like(post);
    console.log(post);
    const thread = await agent.getPostThread({
      uri: post.uri,
      depth: 0,
    });
    let image: string | undefined;
    let threadPost: AppBskyFeedDefs.ThreadViewPost | unknown =
      thread.data.thread;

    if (!AppBskyFeedDefs.isThreadViewPost(thread.data.thread)) return;

    while (!image && AppBskyFeedDefs.isThreadViewPost(threadPost)) {
      if (AppBskyEmbedImages.isView(threadPost.post.embed)) {
        image = threadPost.post.embed.images[0]!.fullsize;
      }
      if (
        AppBskyEmbedRecordWithMedia.isView(threadPost.post.embed) &&
        AppBskyEmbedImages.isView(threadPost.post.embed.media)
      ) {
        image = threadPost.post.embed.media.images[0]!.fullsize;
      }
      threadPost = threadPost.parent;
      console.log(image);
    }

    if (image) {
      console.log("posting");
      const parent = {
        uri: thread.data.thread.post.uri,
        cid: thread.data.thread.post.cid,
      } satisfies ComAtprotoRepoStrongRef.Main;
      await agent.post({
        text: "you can buy the tshirt here!! do it now!!!!",
        langs: ["en"],
        tags: ['🤖'],
        embed: {
          $type: "app.bsky.embed.external",
          external: {
            uri: `https://tshirt.mozzius.dev?design=${encodeURIComponent(
              image
            )}`,
            title: "Buy the tshirt here!!!!",
            description: "hand crafted just for u :)",
          },
        } satisfies AppBskyEmbedExternal.Main,
        reply: {
          parent,
          root: AppBskyFeedPost.isRecord(thread.data.thread.post)
            ? thread.data.thread.post.reply?.root ?? parent
            : parent,
        } satisfies AppBskyFeedPost.ReplyRef,
      });
    }
  });

  bot.setHandler(Events.REPLY, async (event) => {
    const { post } = event;
    console.log(`got reply from ${post.author.handle}: ${post.text}`);
    await bot.like(post);
  });

  bot.setHandler(Events.FOLLOW, async (event) => {
    const { user } = event;
    console.log(`got follow from ${user.handle}`);
    await bot.follow(user.did);
  });

  bot.startPolling(); // start polling for events
}

main().catch((err) => {
  console.error("uncaught error in main:", err);
  process.exit(1);
});
