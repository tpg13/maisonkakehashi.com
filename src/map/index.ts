export interface PropertyData {
  id: string;
  title: string;
  japaneseTitle?: string;
  price: string;
  priceEur?: string;
  priceEurAmount?: number;
  priceJpy?: string;
  location: string;
  region?: string;
  coordinates: [number, number]; // [longitude, latitude]
  type?: string;
  status?: string;
  landArea?: string;
  floorArea?: string;
  yearBuilt?: string;
  features?: string[];
  description: string;
  image?: string;
  images?: string[];
}

export interface LoadedProperty extends PropertyData {
  imageUrl: string;
  imageUrls: string[];
  folderName: string;
  priceEurAmount: number;
}

// 1. Discover all property.json files inside each subfolder of src/map/
const propertyJsonModules = import.meta.glob<Record<string, any>>('/src/map/*/property.json', {
  eager: true,
});

// 2. Discover all image files inside each subfolder of src/map/
const propertyImageModules = import.meta.glob<string>(
  '/src/map/*/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true, query: '?url', import: 'default' }
);

function extractNumericEur(data: PropertyData): number {
  if (data.priceEurAmount && data.priceEurAmount > 0) {
    return data.priceEurAmount;
  }
  if (data.priceEur) {
    const cleaned = data.priceEur.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) return num;
  }
  if (data.price && data.price.includes('€')) {
    const cleaned = data.price.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) return num;
  }
  // If price is in JPY, approximate conversion (160 JPY ~ 1 EUR)
  if (data.price) {
    const cleaned = data.price.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 100000) return Math.round(num / 160);
  }
  return 0;
}

export function getAllProperties(): LoadedProperty[] {
  const properties: LoadedProperty[] = [];

  for (const [jsonPath, moduleContent] of Object.entries(propertyJsonModules)) {
    try {
      const data: PropertyData = (moduleContent as any).default || moduleContent;
      if (!data || !data.coordinates || !Array.isArray(data.coordinates) || data.coordinates.length < 2) {
        continue;
      }

      // Extract folder name from path, e.g. "/src/map/kofu-house/property.json" -> "kofu-house"
      const match = jsonPath.match(/\/src\/map\/([^/]+)\/property\.json$/);
      const folderName = match ? match[1] : (data.id || 'property');
      const folderPrefix = `/src/map/${folderName}/`;

      const imageUrls: string[] = [];

      // If specific images are listed in property.json, load them in that order
      if (Array.isArray(data.images) && data.images.length > 0) {
        for (const imgName of data.images) {
          const targetPath = `${folderPrefix}${imgName}`;
          if (propertyImageModules[targetPath]) {
            imageUrls.push(propertyImageModules[targetPath]);
          }
        }
      }

      // If no images resolved yet from data.images, collect and sort all images in folder
      if (imageUrls.length === 0) {
        const folderImgs = Object.keys(propertyImageModules)
          .filter((p) => p.startsWith(folderPrefix))
          .sort((a, b) => a.localeCompare(b));

        for (const p of folderImgs) {
          imageUrls.push(propertyImageModules[p]);
        }
      }

      const primaryImage = imageUrls[0] || '';
      const eurAmount = extractNumericEur(data);

      properties.push({
        ...data,
        id: data.id || folderName,
        imageUrl: primaryImage,
        imageUrls,
        folderName,
        priceEurAmount: eurAmount,
      });
    } catch (err) {
      console.error('Error loading property from', jsonPath, err);
    }
  }

  // Sort properties so featured/latest appears first
  return properties.sort((a, b) => (b.id === 'kofu' ? 1 : 0) - (a.id === 'kofu' ? 1 : 0));
}
