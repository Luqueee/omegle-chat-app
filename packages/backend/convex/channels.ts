import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query, mutation, MutationCtx } from "./_generated/server";
import { getCurrentUser, validateSecret } from "./model";
import ResultData from "./model/resultData";
import { generateUuidWithCrypto } from "./utils";

export interface Channel {
  _id: Id<"channels">;
  closed: boolean;
  user1Id?: Id<"users">;
  user2Id?: Id<"users">;
}

const createChannel = async (ctx: MutationCtx) => {
  const res = await ctx.db.insert("channels", {
    closed: false,
  });

  return res;
};

export const search = mutation({
  args: {},
  handler: async (ctx, {}) => {
    const result = new ResultData<{ chatId: string }>();
    const user = await getCurrentUser(ctx);

    if (!user) {
      result.addError({ message: "Unauthorized" });
      return result.response();
    }

    // validate that user is not into any open channel
    const userIsIntoAChannel = await ctx.db
      .query("channels")
      .withIndex("by_closed", (q) => q.eq("closed", false))
      .filter((order) =>
        order.or(
          order.eq("user1Id", user._id.toString()),
          order.eq("user2Id", user._id.toString())
        )
      )
      .first();
    console.log("User is into a channel:", userIsIntoAChannel);

    if (userIsIntoAChannel) {
      result.addError({ message: "User is already in an open channel" });
      return result.response();
    }

    const openChannelsAvailable = await ctx.db
      .query("channels")
      .withIndex("by_closed", (q) => q.eq("closed", false))
      .filter((channel) => {
        const user1IdExists = "user1Id" in channel;
        const user2IdExists = "user2Id" in channel;

        return !user1IdExists || !user2IdExists;
      }) // These fields are optional, so there's no strict requirement for them to be non-null
      .first();

    console.log("Open channels available:", openChannelsAvailable);

    if (!openChannelsAvailable) {
      // No open channels, create one and assign user as user1
      const newChannel = await createChannel(ctx);

      await ctx.db.patch(newChannel, {
        user1Id: user._id,
      });

      result.addData({ chatId: newChannel.toString() });
      return result.response();
    }

    // There are open channels, assign user as user2 to the first one
    await ctx.db.patch(openChannelsAvailable._id, {
      user2Id: user._id,
    });

    const modifiedChannel = await ctx.db.get(openChannelsAvailable._id);
    console.log("Modified channel:", modifiedChannel);

    if (modifiedChannel?.user1Id && modifiedChannel?.user2Id) {
      console.log(
        `Channel ${modifiedChannel._id.toString()} is now full with users: ${modifiedChannel.user1Id.toString()} and ${modifiedChannel.user2Id.toString()}`
      );

      await ctx.db.patch(modifiedChannel._id, {
        closed: true,
      });
    }

    result.addData({ chatId: openChannelsAvailable._id.toString() });
    return result.response();
  },
});

export const validateChannel = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, { channelId }) => {
    const result = new ResultData<{ ok: boolean }>();
    const user = await getCurrentUser(ctx);

    if (!user) {
      result.addError({ message: "Unauthorized" });
      return result.response();
    }

    const channel = await ctx.db.get(channelId);
    if (!channel) {
      result.addError({ message: "Channel not found" });
      return result.response();
    }

    if (channel.closed) {
      result.addError({ message: "Channel is closed" });
      return result.response();
    }

    result.addData({ ok: true });
    return result.response();
  },
});

export const leaveChannel = mutation({
  args: {
    secret: v.string(),
    channelId: v.id("channels"),
    userId: v.id("users"),
  },
  handler: async (ctx, { channelId, userId, secret }) => {
    const result = new ResultData<null>();

    const auth = validateSecret(secret);
    if (!auth) {
      result.addError({ message: "Invalid secret" });
      return result.response();
    }

    console.log(
      "Leaving channel:",
      channelId.toString(),
      "by user:",
      userId.toString()
    );

    const channel = await ctx.db.get(channelId);
    if (!channel) {
      result.addError({ message: "Channel not found" });
      return result.response();
    }

    if (
      channel.user1Id?.toString() !== userId.toString() &&
      channel.user2Id?.toString() !== userId.toString()
    ) {
      result.addError({ message: "User not in channel" });
      return result.response();
    }

    await ctx.db.patch(channelId, {
      closed: true,
    });

    console.log("Channel closed:", channelId.toString());
    return result.response();
  },
});

export const getRoomData = query({
  args: {
    channelId: v.id("channels"),
    secret: v.string(),
  },
  handler: async (ctx, { channelId, secret }) => {
    const result = new ResultData<Channel>();

    const auth = validateSecret(secret);
    if (!auth) {
      result.addError({ message: "Invalid secret" });
      return result.response();
    }

    const channel = await ctx.db.get(channelId);
    if (!channel) {
      result.addError({ message: "Channel not found" });
      return result.response();
    }

    result.addData(channel);
    return result.response();
  },
});
