import { staticFile, getRemotionEnvironment } from 'remotion';

export const getAssetSrc = (file: string) => {
  const env = getRemotionEnvironment();
  if (env.isStudio || env.isRendering) {
    return staticFile(file);
  }
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/${file}`;
};
