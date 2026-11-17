import type { ImageSourcePropType } from 'react-native';

const productImages: Record<string, ImageSourcePropType> = {
  'ao.png': require('./assets/images/ao.png'),
  'balo.png': require('./assets/images/balo.png'),
  'giay.png': require('./assets/images/giay.png'),
  'mu-luoi-trai.png': require('./assets/images/mu-luoi-trai.png'),
  'tui-xach.png': require('./assets/images/tui-xach.png'),
  'vi.png': require('./assets/images/vi.png'),
};

const getSnapshotNameImage = (
  name: string,
): ImageSourcePropType | undefined => {
  const savedName = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

  if (savedName.includes('balo')) return productImages['balo.png'];
  if (savedName.includes('giay')) return productImages['giay.png'];
  if (savedName.includes('mu ')) return productImages['mu-luoi-trai.png'];
  if (savedName.includes('tui')) return productImages['tui-xach.png'];
  if (savedName.includes('vi ')) return productImages['vi.png'];
  if (savedName.includes('ao ')) return productImages['ao.png'];
  return undefined;
};

export const getOrderItemImage = (
  image: string | null | undefined,
  name: string,
): ImageSourcePropType | { uri: string } | undefined => {
  const savedImage = image?.trim();
  if (savedImage) {
    if (/^(https?|file|content|data):/i.test(savedImage)) {
      return { uri: savedImage };
    }

    if (savedImage.startsWith('/')) {
      return { uri: `file://${savedImage}` };
    }

    const fileName = savedImage.split(/[\\/]/).pop()?.toLowerCase();
    const imageSource = fileName ? productImages[fileName] : undefined;
    if (imageSource) return imageSource;
  }

  return getSnapshotNameImage(name);
};
