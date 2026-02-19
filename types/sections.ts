export type SectionType = 
  | 'hero'
  | 'text'
  | 'features'
  | 'properties'
  | 'gallery'
  | 'contact'
  | 'cta'
  | 'testimonials'
  | 'stats'
  | 'faq'
  | 'video'
  | 'team';

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

export interface TestimonialsSection extends BaseSection {
  type: 'testimonials';
  data: {
    title: string;
    subtitle?: string;
    testimonials: Array<{
      name: string;
      role: string;
      content: string;
      rating?: number;
    }>;
  };
}

export interface StatsSection extends BaseSection {
  type: 'stats';
  data: {
    title?: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
}

export interface FAQSection extends BaseSection {
  type: 'faq';
  data: {
    title: string;
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
}

export interface VideoSection extends BaseSection {
  type: 'video';
  data: {
    title?: string;
    videoUrl: string;
    description?: string;
  };
}

export interface TeamSection extends BaseSection {
  type: 'team';
  data: {
    title: string;
    members: Array<{
      name: string;
      role: string;
      image?: string;
      bio?: string;
    }>;
  };
}

export type Section =
  | HeroSection
  | TextSection
  | FeaturesSection
  | PropertiesSection
  | GallerySection
  | ContactSection
  | CTASection
  | TestimonialsSection
  | StatsSection
  | FAQSection
  | VideoSection
  | TeamSection;

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
  },
  testimonials: {
    type: 'testimonials',
    data: {
      title: 'Müşteri Yorumları',
      subtitle: 'Müşterilerimiz ne diyor',
      testimonials: [
        { name: 'Müşteri 1', role: 'Ev Sahibi', content: 'Harika bir deneyimdi!', rating: 5 },
        { name: 'Müşteri 2', role: 'Kiracı', content: 'Çok memnun kaldım', rating: 5 }
      ]
    }
  },
  stats: {
    type: 'stats',
    data: {
      title: 'Rakamlarla Biz',
      stats: [
        { value: '100+', label: 'Mutlu Müşteri' },
        { value: '50+', label: 'Satılan Gayrimenkul' },
        { value: '10+', label: 'Yıllık Deneyim' }
      ]
    }
  },
  faq: {
    type: 'faq',
    data: {
      title: 'Sık Sorulan Sorular',
      questions: [
        { question: 'Nasıl başvurabilirim?', answer: 'Formu doldurun veya bizi arayın.' },
        { question: 'Hizmet ücretiniz nedir?', answer: 'Detaylı bilgi için bizimle iletişime geçin.' }
      ]
    }
  },
  video: {
    type: 'video',
    data: {
      title: 'Tanıtım Videosu',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Hizmetlerimiz hakkında daha fazla bilgi'
    }
  },
  team: {
    type: 'team',
    data: {
      title: 'Ekibimiz',
      members: [
        { name: 'Danışman 1', role: 'Gayrimenkul Uzmanı', bio: 'Uzman danışman' },
        { name: 'Danışman 2', role: 'Satış Müdürü', bio: 'Deneyimli satış uzmanı' }
      ]
    }
  }
};
