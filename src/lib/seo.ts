import { Metadata } from "next";

interface GenerateMetadataParams {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://talentdash.com";

export function generateSeoMetadata({
  title,
  description,
  path,
  ogType = "website",
  ogImage = "/og-image.png",
}: GenerateMetadataParams): Metadata {
  const canonicalUrl = `${SITE_URL}${path}`;

  return {
    title: `${title} | TalentDash`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | TalentDash`,
      description,
      url: canonicalUrl,
      siteName: "TalentDash",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: ogType,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | TalentDash`,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`],
    },
  };
}

export function generateCompanyJsonLd(company: any, medianComp: number, recordsCount: number) {
  const siteUrl = SITE_URL;
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": company.name,
      "url": `${siteUrl}/companies/${company.slug}`,
      "logo": `${siteUrl}/logo.png`,
      "knowsAbout": company.industry,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": company.headquarters,
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "reviewCount": recordsCount || 1,
        "bestRating": "5",
        "worstRating": "1"
      }
    }),
  };
}

export function generateSalariesJsonLd(salaries: any[]) {
  return {
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": salaries.slice(0, 10).map((s, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "JobPosting",
          "title": s.role,
          "hiringOrganization": {
            "@type": "Organization",
            "name": s.company.name,
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": s.location,
            }
          },
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": s.currency,
            "value": {
              "@type": "QuantitativeValue",
              "value": Number(s.total_compensation),
              "unitText": "YEAR"
            }
          }
        }
      }))
    }),
  };
}
