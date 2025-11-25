import { mutation, query } from './_generated/server';
import { components } from './_generated/api';
import { v } from 'convex/values';
import { Presence } from '@convex-dev/presence';
import * as UserModel from './model/user';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from './_generated/dataModel';

export const presence = new Presence(components.presence);

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.number(),
  },
  handler: async (ctx, { roomId, userId, sessionId, interval }) => {
    // TODO: Add your auth checks here.
    console.log('heartbeat', roomId, userId, sessionId, interval);
    const authUserId = await getAuthUserId(ctx);
    if (authUserId === null || authUserId !== userId) {
      // We should probably handle this more gracefully.
      throw new Error('Unauthorized');
    }

    return await presence.heartbeat(ctx, roomId, userId, sessionId, interval);
  },
});

export const list = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    // Avoid adding per-user reads so all subscriptions can share same cache.
    const presenceList = await presence.list(ctx, roomToken);
    const listWithUserInfo = await Promise.all(
      presenceList.map(async (entry) => {
        const user = await ctx.db.get(entry.userId as Id<'users'>);
        if (!user) {
          return entry;
        }
        return {
          ...entry,
          city: user?.city,
          name: user?.name,
          image: user?.image,
        };
      })
    );
    return listWithUserInfo;
  },
});

export const listCities = query({
  args: { roomToken: v.string() },
  handler: async (ctx, { roomToken }) => {
    // Avoid adding per-user reads so all subscriptions can share same cache.

    const presenceList = await presence.list(ctx, roomToken);
    const usersWithDetails = await Promise.all(
      presenceList.map(async (entry) => {
        const user = await ctx.db.get(entry.userId as Id<'users'>);
        if (!user) {
          return null;
        }
        return {
          ...entry,
          name: user?.name,
          image: user?.image,
          city: user?.city,
        };
      })
    );

    console.log('Users with details:', usersWithDetails);

    // Count users by city
    const citiesCount = usersWithDetails
      .filter((user) => user !== null && user.city)
      .reduce(
        (acc, user) => {
          const city = user!.city;
          if (!city) return acc;
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    console.log('Cities count:', citiesCount);

    return citiesCount;
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    // Can't check auth here because it's called over http from sendBeacon.
    console.log('Disconnecting session:', sessionToken);
    return await presence.disconnect(ctx, sessionToken);
  },
});
