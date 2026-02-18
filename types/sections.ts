export type SectionType = 
  | 'hero'
  | 'text'
  | 'features'
  | 'properties'
  | 'gallery'
  | 'contact'
  | 'cta';

export interface BaseSection {
  id: string;
  type: SectionType;
  order: number;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  data: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink?: string;
    stats?: Array<{ value: string; label: string }>;
  };
}

export interface TextSection extends BaseSection {
  type: 'text';
  data: {
    title?: string;
    content: string;
  };
}

export interface FeaturesSection extends BaseSection {
  type: 'features';
  data: {
    title: string;
    subtitle?: string;
    items: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
}

export interface PropertiesSection extends BaseSection {
  type: 'properties';
  data: {
    title: string;
  };
}

export interface GallerySection extends BaseSection {
  type: 'gallery';
  data: {
    title?: string;
    images: Array<{
      url: string;
      alt: string;
    }>;
  };
}

export interface ContactSection extends BaseSection {
  type: 'contact';
  data: {
    title: string;
    subtitle?: string;
  };
}

export interface CTASection extends BaseSection {
  type: 'cta';
  data: {
    title: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
  };
}

export type Section =
  | HeroSection
  | TextSection
  | FeaturesSection
  | PropertiesSection
  | GallerySection
  | ContactSection
  | CTASection;

export const SECTION_TEMPLATES: Record<SectionType, Partial<Section>> = {
  hero: {
    type: 'hero',
    data: {
      title: 'Başlık Giriniz',
      subtitle: 'Alt başlık giriniz',
      buttonText: 'Hemen İletişime Geçin',
      stats: []
    }
  },
  text: {
    type: 'text',
    data: {
      title: '',
      content: 'Metin içeriği buraya...'
    }
  },
  features: {
    type: 'features',
    data: {
      title: 'Özellikler',
      subtitle: '',
      items: [
        { title: 'Özellik 1', description: 'Açıklama' },
        { title: 'Özellik 2', description: 'Açıklama' },
        { title: 'Özellik 3', description: 'Açıklama' }
      ]
    }
  },
  properties: {
    type: 'properties',
    data: {
      title: 'Portföy'
    }
  },
  gallery: {
    type: 'gallery',
    data: {
      title: 'Galeri',
      images: []
    }
  },
  contact: {
    type: 'contact',
    data: {
      title: 'İletişim',
      subtitle: 'Bizimle iletişime geçin'
    }
  },
  cta: {
    type: 'cta',
    data: {
      title: 'Hemen Başlayın',
      description: 'Size yardımcı olmak için buradayız',
      buttonText: 'İletişime Geçin'
    }
  }
};
