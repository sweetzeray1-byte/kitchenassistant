import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORY_HUBS, getHub, hubPath } from "@/lib/taxonomy";
import { fetchHubRecipes } from "@/lib/hub-data";
import { HubView } from "@/components/hub-page";
import { breadcrumbJsonLd, jsonLdScript, recipeItemListJsonLd } from "@/lib/seo";

// Pre-render the known category hubs at build; unknown slugs 404 via notFound().
export function generateStaticParams() {
  return CATEGORY_HUBS.map((h) => ({ category: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const hub = getHub("category", category);
  if (!hub) return {};
  return {
    title: hub.metaTitle,
    description: hub.metaDescription,
    alternates: { canonical: hubPath(hub) },
    openGraph: {
      url: hubPath(hub),
      title: hub.metaTitle,
      description: hub.metaDescription,
    },
  };
}

export const revalidate = 600;

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const hub = getHub("category", category);
  if (!hub) notFound();

  const recipes = await fetchHubRecipes(hub);
  const itemList = recipeItemListJsonLd(recipes, { name: hub.h1 });
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Discover", path: "/discover" },
    { name: hub.h1, path: hubPath(hub) },
  ]);

  return (
    <>
      {itemList && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(itemList) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }}
      />
      <HubView hub={hub} recipes={recipes} />
    </>
  );
}
