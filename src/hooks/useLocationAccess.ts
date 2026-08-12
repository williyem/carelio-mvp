import { useState } from 'react';
import { toast } from 'sonner';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

export const useLocationAccess = () => {
  const [isLocationSupported, setIsLocationSupported] = useState<
    boolean | null
  >(null);
  const [locationAccessState, setLocationAccessState] = useState<
    'not_requested' | 'supported' | 'blocked' | 'unsupported'
  >('not_requested');

  const confirmLocationAccess = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error('Location Access Unavailable', {
          description: 'Your browser does not support geolocation services.',
        });
        setIsLocationSupported(false);
        setLocationAccessState('unsupported');
        resolve(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        () => {
          setIsLocationSupported(true);
          setLocationAccessState('supported');
          resolve(true);
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              toast.error('Location Access Blocked', {
                description:
                  'Please enable location access in your browser settings.',
              });
              setLocationAccessState('blocked');
              break;
            case error.POSITION_UNAVAILABLE:
              toast.error('Location Unavailable', {
                description:
                  'Location information is unavailable. Please check your device settings.',
              });
              setLocationAccessState('unsupported');
              break;
            case error.TIMEOUT:
              toast.error('Location Request Timeout', {
                description: 'Location request timed out. Please try again.',
              });
              setLocationAccessState('unsupported');
              break;
          }

          setIsLocationSupported(false);
          resolve(false);
        },
        {
          timeout: 15000,
          maximumAge: 60000, // Allow positions up to 1 minute old
          enableHighAccuracy: false, // verification only, no need for high accuracy
        }
      );
    });
  };

  const getCurrentLocation = (): Promise<LocationCoordinates | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error('Geolocation Unavailable', {
          description: 'Your browser does not support geolocation services.',
        });
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          toast.error('Location Retrieval Failed', {
            description:
              'Unable to retrieve location. Please check your location settings.',
          });
          resolve(null);
        }
      );
    });
  };

  return {
    confirmLocationAccess,
    getCurrentLocation,
    isLocationSupported,
    locationAccessState,
  };
};
