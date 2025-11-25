// convex/example.ts
import { R2 } from '@convex-dev/r2';
import { components } from './_generated/api';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';
import * as UserModel from './model/user';
import ResultData from './model/resultData';
export const r2 = new R2(components.r2);
const MAX_FILES_PER_USER = 2;

export const { generateUploadUrl, syncMetadata } = r2.clientApi({
  checkUpload: async (ctx, bucket) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    console.log(`Checking upload to bucket ${bucket} ${userId}`);
    const images = await ctx.db
      .query('images')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    if (images.length >= MAX_FILES_PER_USER) {
      throw new Error('Has alcanzado el límite de subidas permitidas.');
    }
  },
  checkDelete: async (ctx, bucket, key) => {
    const userId = await getAuthUserId(ctx);
    console.log(`Checking delete from bucket ${bucket} with key ${key} with user ${userId}`);
  },
  onDelete: async (ctx, bucket, key) => {
    console.log(`File deleted from bucket ${bucket} with key ${key}`);

    const image = await ctx.db
      .query('images')
      .withIndex('r2Key', (q) => q.eq('r2Key', key))
      .first();

    console.log('Imagen encontrada para borrar:', image);
    if (image && image._id) {
      await ctx.db.delete(image._id as any);
    } else {
      console.log('No se encontró la imagen en la base de datos');
    }
  },
  onUpload: async (ctx, bucket, key) => {
    // ...do something with the key
    // This technically runs in the `syncMetadata` mutation, as the upload
    // is performed from the client side. Will run if using the `useUploadFile`
    // hook, or if `syncMetadata` function is called directly. Runs after the
    // `checkUpload` callback.

    console.log(`File uploaded to bucket ${bucket} with key ${key}`);
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    await ctx.db.insert('images', {
      r2Key: key,
      userId,
    });
  },
});

export const generateUploadUrlWithCustomKey = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { ok: false, reason: 'NOT_AUTH' };

    const images = await ctx.db
      .query('images')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    if (images.length >= MAX_FILES_PER_USER) {
      return { ok: false, reason: 'LIMIT_REACHED' };
    }

    const key = `${userId}.${crypto.randomUUID()}`;
    const uploadUrl = await r2.generateUploadUrl(key);

    return { ok: true, uploadUrl, key };
  },
});

export interface DeleteImageResponse {
  deleted: boolean;
}

export const deleteImageByKey = mutation({
  args: { r2Key: v.string() },
  handler: async (ctx, { r2Key }) => {
    const respone = new ResultData<DeleteImageResponse>();
    const user = await UserModel.getCurrentUser(ctx);

    if (!user) {
      respone.addError({ message: 'User not found' });
      return respone.response();
    }

    const image = await ctx.db
      .query('images')
      .withIndex('r2Key', (q) => q.eq('r2Key', r2Key))
      .first();

    if (!image) {
      respone.addError({ message: 'Image not found' });
      return respone.response();
    }

    if (image.userId.toString() !== user._id.toString()) {
      respone.addError({ message: 'Unauthorized to delete this image' });
      return respone.response();
    }

    console.log('Deleting image with r2Key:', r2Key, user._id);

    await r2.deleteObject(ctx, r2Key);
    await ctx.db.delete(image._id as any);
    respone.addData({ deleted: true });
    return respone.response();
  },
});
