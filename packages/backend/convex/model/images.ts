import { Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';
import { r2 } from '../images';
import { getCurrentUser } from './user';

export type Image = {
  _id: Id<'images'>;
  userId: Id<'users'>;
  r2Key: string;
  _creationTime: number;
  imageUrl: string;
};

export async function getProfileImages(
  ctx: QueryCtx,
  { userId }: { userId: Id<'users'> }
): Promise<Image[]> {
  const images = await ctx.db
    .query('images')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect();

  const result = await Promise.all(
    images.map(async (img) => ({
      ...img,
      imageUrl: await r2.getUrl(
        img.r2Key
        // Options object is optional, can be omitted
      ),
    }))
  );

  return result;
}
