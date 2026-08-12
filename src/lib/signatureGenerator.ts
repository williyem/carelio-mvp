import { useRef, useEffect } from 'react';
import { UseFormSetValue, Path, PathValue } from 'react-hook-form';

export const generateSignatureImage = (name: string): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx || !name.trim()) return '';

  canvas.width = 300;
  canvas.height = 80;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Set font properties for signature-like appearance
  ctx.font = "italic 32px 'Brush Script MT', cursive, serif";
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw the signature
  ctx.fillText(name, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
};

export const useDebouncedSignatureGeneration = <
  T extends Record<string, unknown>,
>(
  name: string,
  isAgreed: boolean,
  setValue: UseFormSetValue<T>,
  signatureFieldName: Path<T>,
  debounceMs: number = 500
) => {
  const debouncedGenerateSignature = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debouncedGenerateSignature.current) {
      clearTimeout(debouncedGenerateSignature.current);
    }

    debouncedGenerateSignature.current = setTimeout(() => {
      if (name.trim() && isAgreed) {
        const signatureImage = generateSignatureImage(name);
        setValue(
          signatureFieldName,
          signatureImage as PathValue<T, keyof T & Path<T>>,
          {
            shouldValidate: true,
          }
        );
      } else {
        setValue(signatureFieldName, '' as PathValue<T, keyof T & Path<T>>, {
          shouldValidate: true,
        });
      }
    }, debounceMs);

    // Cleanup function
    return () => {
      if (debouncedGenerateSignature.current) {
        clearTimeout(debouncedGenerateSignature.current);
      }
    };
  }, [name, isAgreed, setValue, signatureFieldName, debounceMs]);
};
