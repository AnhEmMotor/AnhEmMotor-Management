import { ref } from "vue";
import { fetchExternalAuthConfig } from "@/api/auth/auth.api";

// Declare globals for Google and Facebook SDKs
declare global {
  interface Window {
    google: any;
    FB: any;
    fbAsyncInit: () => void;
  }
}

export function useOAuth() {
  const isGoogleReady = ref(false);
  const isFacebookReady = ref(false);
  const authConfig = ref<any>(null);

  // Store promise resolvers for One Tap
  let googleResolve: ((token: string) => void) | null = null;
  let googleReject: ((err: Error) => void) | null = null;

  const initOAuth = async () => {
    try {
      const config = await fetchExternalAuthConfig();
      if (!config) {
        console.warn("OAuth init: No config returned");
        return;
      }
      authConfig.value = config;

      // Initialize Google SDK
      const setupGoogle = () => {
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: (response: any) => {
            if (response.credential) {
              if (googleResolve) googleResolve(response.credential);
            } else {
              if (googleReject) googleReject(new Error("Google login failed"));
            }
            googleResolve = null;
            googleReject = null;
          },
        });
        isGoogleReady.value = true;
      };

      if (!window.google) {
        const scriptG = document.createElement("script");
        scriptG.src = "https://accounts.google.com/gsi/client";
        scriptG.async = true;
        scriptG.defer = true;
        scriptG.onload = setupGoogle;
        document.head.appendChild(scriptG);
      } else {
        setupGoogle();
      }

      // Initialize Facebook SDK
      const setupFacebook = () => {
        window.FB.init({
          appId: config.facebookAppId,
          cookie: true,
          xfbml: true,
          version: "v18.0",
        });
        isFacebookReady.value = true;
      };

      if (!window.FB) {
        window.fbAsyncInit = setupFacebook;
        const scriptF = document.createElement("script");
        scriptF.src = "https://connect.facebook.net/en_US/sdk.js";
        scriptF.async = true;
        scriptF.defer = true;
        document.head.appendChild(scriptF);
      } else {
        setupFacebook();
      }
    } catch (error) {
      console.error("Failed to initialize OAuth:", error);
    }
  };

  const loginWithGoogleSDK = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isGoogleReady.value || !window.google) {
        return reject(
          new Error("Google SDK is not ready or blocked by browser"),
        );
      }

      googleResolve = resolve;
      googleReject = reject;

      try {
        // Use One Tap to get the id_token
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(
              new Error(
                "Google popup blocked or skipped by user. Allow popups for this site.",
              ),
            );
            googleResolve = null;
            googleReject = null;
          }
        });
      } catch (e) {
        reject(e);
        googleResolve = null;
        googleReject = null;
      }
    });
  };

  const loginWithFacebookSDK = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!isFacebookReady.value || !window.FB) {
        return reject(
          new Error("Facebook SDK is not ready or blocked by browser"),
        );
      }

      try {
        window.FB.login(
          (response: any) => {
            if (response.authResponse && response.authResponse.accessToken) {
              resolve(response.authResponse.accessToken);
            } else {
              reject(
                new Error("User cancelled login or did not fully authorize."),
              );
            }
          },
          { scope: "public_profile,email" },
        );
      } catch (e) {
        reject(e);
      }
    });
  };

  return {
    isGoogleReady,
    isFacebookReady,
    authConfig,
    initOAuth,
    loginWithGoogleSDK,
    loginWithFacebookSDK,
  };
}
