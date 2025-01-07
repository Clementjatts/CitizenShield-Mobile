import { Link, ExternalPathString } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform, GestureResponderEvent } from 'react-native';

type ExternalLinkProps = {
  href: ExternalPathString;
} & Omit<React.ComponentProps<typeof Link>, 'href'>;

export function ExternalLink({ href, ...props }: ExternalLinkProps) {
  const handlePress = React.useCallback(async (e: React.MouseEvent | GestureResponderEvent) => {
    if (Platform.OS !== 'web') {
      e.preventDefault();
      try {
        await WebBrowser.openBrowserAsync(href);
      } catch (error) {
        console.error('Failed to open external link:', error);
      }
    }
  }, [href]);

  return (
    <Link
      target="_blank"
      {...props}
      href={href}
      onPress={handlePress}
    />
  );
}
