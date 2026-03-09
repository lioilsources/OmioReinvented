import { Ionicons } from '@expo/vector-icons';

const POI_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  museum: 'color-palette',
  beach: 'umbrella',
  castle: 'shield',
  church: 'business',
  park: 'leaf',
  mountain: 'trail-sign',
  lake: 'water',
  theater: 'musical-notes',
  zoo: 'paw',
  market: 'cart',
  bridge: 'git-merge',
  monument: 'trophy',
  palace: 'home',
  garden: 'flower',
  temple: 'star',
  lighthouse: 'flashlight',
  waterfall: 'water',
  spa: 'heart',
  vineyard: 'wine',
  island: 'boat',
};

const FALLBACK_ICON: keyof typeof Ionicons.glyphMap = 'location';

export function getPoiIcon(type: string): keyof typeof Ionicons.glyphMap {
  const icon = POI_ICON_MAP[type];
  if (!icon && __DEV__) {
    console.log(`[POI] Unknown POI type: "${type}", using fallback icon`);
  }
  return icon ?? FALLBACK_ICON;
}
