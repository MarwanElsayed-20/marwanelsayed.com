import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { navItems } from "@/config/navigation";

export const metadata = { openGraph: { images: [] }, twitter: { images: [] } };

export default function NotFound() {
  const others = navItems.filter((item) => item.href !== "/");
  return (
    <>
      <PageHeader title="Page not found" intro="The page you are looking for does not exist." />
      <Container className="pb-section">
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          {others.map((item) => (
            <ButtonLink key={item.href} href={item.href} variant="secondary">
              {item.label}
            </ButtonLink>
          ))}
        </div>
      </Container>
    </>
  );
}
