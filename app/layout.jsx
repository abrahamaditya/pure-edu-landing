import './globals.css';

export const metadata = {
  title: 'PURE Education | Life Skills & Character Education Partner for Students, Teachers, and Parents',
  description: 'PURE Education — partner edukasi terpercaya sejak 2010. Program life skills, character building, dan pengembangan holistik untuk siswa, guru, dan orang tua melalui pendekatan psikologi inovatif.',
  keywords: 'PURE Education, life skills, character building, pelatihan guru, parenting class, pendidikan karakter, workshop guru, leadership camp, motivational day, edukasi anak, pengembangan karakter, Jakarta',
  authors: [{ name: 'PURE Education' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://pure-tco.com/',
  },
  openGraph: {
    type: 'website',
    url: 'https://pure-tco.com/',
    title: 'PURE Education | Life Skills & Character Education Partner',
    description: 'Program life skills, character building, dan pengembangan holistik untuk siswa, guru, dan orang tua melalui pendekatan psikologi inovatif. 10.000+ siswa dilatih, 500+ guru diberdayakan.',
    images: [
      {
        url: 'https://pure-tco.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PURE Education — Partner Edukasi Life Skills & Karakter',
        type: 'image/png',
      },
    ],
    locale: 'id_ID',
    siteName: 'PURE Education',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PURE Education | Life Skills & Character Education Partner',
    description: 'Program life skills, character building, dan pengembangan holistik untuk siswa, guru, dan orang tua. 15+ tahun berdedikasi.',
    images: [{
      url: 'https://pure-tco.com/og-image.png',
      alt: 'PURE Education — Partner Edukasi Life Skills & Karakter',
    }],
  },
};

export const viewport = {
  themeColor: '#EA6319',
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "PURE Education",
    "alternateName": "PURE TCO",
    "url": "https://pure-tco.com",
    "logo": "https://pure-tco.com/assets/logo/logo-pure-edu.png",
    "image": "https://pure-tco.com/assets/image/section_1.webp",
    "description": "PURE Education adalah partner edukasi terpercaya sejak 2010 yang menyediakan program life skills, character building, dan pengembangan holistik untuk siswa, guru, dan orang tua melalui pendekatan psikologi inovatif.",
    "foundingDate": "2010",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Green Lake City",
        "addressRegion": "Jakarta",
        "addressCountry": "ID"
    },
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+62-878-7719-8886",
        "contactType": "customer service",
        "availableLanguage": ["Indonesian", "English"],
        "email": "info@pure-tco.com"
    },
    "sameAs": [
        "https://www.instagram.com/pureedu.tco/",
        "https://linktr.ee/pure_tco"
    ],
    "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "minValue": 10
    },
    "areaServed": {
        "@type": "Country",
        "name": "Indonesia"
    },
    "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Program PURE Education",
        "itemListElement": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "EducationalOccupationalProgram",
                    "name": "Head to Toe Program",
                    "description": "Program pengembangan holistik yang mengintegrasikan aspek psikologis, emosional, dan fisik untuk generasi muda."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "EducationalOccupationalProgram",
                    "name": "Workshop Guru",
                    "description": "Pelatihan Creative Teaching, Stress Management, dan Student Engagement untuk guru."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "EducationalOccupationalProgram",
                    "name": "Parenting Class",
                    "description": "Kelas parenting untuk membangun kemitraan orang tua dalam pendidikan anak."
                }
            }
        ]
    }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://api.iconify.design" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <meta name="msapplication-TileColor" content="#EA6319" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
