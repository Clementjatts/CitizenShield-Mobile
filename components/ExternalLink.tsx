/**
 * External link component that handles opening URLs in the device's browser
 * Provides a consistent way to handle external links across web and mobile platforms
 */

import { Link, ExternalPathString } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform, GestureResponderEvent } from 'react-native';

/**
 * Props for the ExternalLink component
 * @interface ExternalLinkProps
 * @property {ExternalPathString} href - The URL to open when the link is pressed
 */
type ExternalLinkProps = {
  href: ExternalPathString;
} & Omit<React.ComponentProps<typeof Link>, 'href'>;

/**
 * ExternalLink Component
 * Handles opening external links differently based on platform:
 * - On web: Opens in a new tab
 * - On mobile: Opens in the device's default browser using WebBrowser
 * 
 * @param {ExternalLinkProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
export function ExternalLink({ href, ...props }: ExternalLinkProps) {
  /**
   * Handles the press event on the link
   * On mobile platforms, prevents default behavior and uses WebBrowser
   */
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
