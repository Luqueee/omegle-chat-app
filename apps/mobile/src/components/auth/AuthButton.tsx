import { useAuthActions } from '@convex-dev/auth/react';
import { useState } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import { openAuthSessionAsync } from 'expo-web-browser';
import { Platform } from 'react-native';
import { Button } from '../ui/button';
import { Text } from '../ui/text';
const redirectTo = makeRedirectUri();

export function SignInWithGoogle() {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuthActions();
  const handleGoogleSignIn = async () => {
    setLoading(true);

    const { redirect } = await signIn('google', {
      redirectTo,
    });

    if (Platform.OS === 'web') {
      return;
    }

    const result = await openAuthSessionAsync(redirect!.toString(), redirectTo);

    if (result.type === 'success') {
      const { url } = result;

      const code = new URL(url).searchParams.get('code')!;

      await signIn('google', { code });
    } else {
      setLoading(false);
    }
  };
  return (
    <Button className="" onPress={handleGoogleSignIn} disabled={loading}>
      <Text className="">Google</Text>
    </Button>
  );
}

export function SignOut() {
  const { signOut } = useAuthActions();

  return (
    <Button onPress={signOut}>
      <Text className="">Sign Out</Text>
    </Button>
  );
}
