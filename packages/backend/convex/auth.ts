import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
// convex/auth.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./model/user";

export type Providers = "google";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google],

  callbacks: {
    async redirect({ redirectTo }) {
      // Allow redirects to the mobile Expo URL or to the web URL.
      // Without this, only redirects to `SITE_URL` are allowed.
      console.log(
        "Requested redirect to:",
        redirectTo,
        process.env.EXPO_URL!,
        process.env.SITE_URL!
      );
      // if (redirectTo !== process.env.EXPO_URL! && redirectTo !== process.env.SITE_URL!) {
      //   throw new Error(`Invalid redirectTo URI ${redirectTo}`);
      // }

      console.log("Redirecting to:", redirectTo);
      return redirectTo;
    },
  },
});

export const getSessionUser = query({
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user;
  },
});

export const setCountryAndCity = mutation({
  args: { country: v.string(), city: v.string() },
  handler: async (ctx, { country, city }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(userId, { country, city });

    return { success: true };
  },
});

export const clearTableUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
  },
});
