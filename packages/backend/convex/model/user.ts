import { getAuthUserId } from '@convex-dev/auth/server';
import { query } from '../_generated/server';
import { Id } from '../_generated/dataModel';

export interface User {
  _id: Id<'users'>;
  name: string;
  email: string;
  image: string;
  country?: string;
  city?: string;
  age?: number;
  bio?: string;
}

export async function getCurrentUser(ctx: any): Promise<User | undefined> {
  // ID del user autenticado según Convex Auth
  const userId = await getAuthUserId(ctx);
  if (!userId) return undefined; // no logueado

  // sacamos el documento de la tabla users
  const user = await ctx.db.get(userId);

  // por seguridad, podrías devolver solo ciertos campos
  if (!user) return undefined;

  const data = {
    _id: userId,
    name: user.name,
    email: user.email,
    image: user.image,
    country: user.country ?? '',
    city: user.city ?? '',
    age: user.age ?? 0,
    bio: user.bio ?? '',
  } as User;

  console.log('Current user:', data);

  return data;
}
