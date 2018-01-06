export const LANDSCAPE = 'landscape';
export const PORTRAIT = 'portrait';

export function orientation(dimensions) {
  if (dimensions.width >= dimensions.height) {
    return LANDSCAPE;
  }
  else {
    return PORTRAIT;
  }
};