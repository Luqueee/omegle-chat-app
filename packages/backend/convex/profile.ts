import { query } from './_generated/server';
import * as UserModel from './model/user';
import * as Images from './model/images';
import { User } from './model/user';
import ResultData from './model/resultData';

export interface ProfileDataResponse {
  user: User;
  images: {
    images: Images.Image[];
    willUpload: boolean;
  };
}

export const getProfileData = query({
  args: {},
  handler: async (ctx) => {
    const result = new ResultData<ProfileDataResponse>();

    try {
      const user = await UserModel.getCurrentUser(ctx);

      if (!user) {
        result.addError({
          message: 'User not found',
        });

        return result.response();
      }

      const images = await Images.getProfileImages(ctx, { userId: user._id });

      // console.log('Profile data fetched:', user);
      console.log('Profile images fetched:', images);

      result.addData({
        user,
        images: {
          images,
          willUpload: images.length < 2,
        },
      });
      result.addMessage('Profile data fetched successfully');

      return result.response();
    } catch (error) {
      console.error('Error fetching profile data:', error);
      result.addError({
        message: 'Error fetching profile data',
      });
      return result.response();
    }
  },
});
