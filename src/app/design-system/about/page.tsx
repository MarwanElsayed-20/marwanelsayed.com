import { AboutView } from "@/components/site/about-view";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { sampleAbout } from "@/content/site/review-samples";

export default function ReviewAboutPage() {
  return (
    <>
      <Container className="pt-6">
        <Text variant="small">Review page: synthetic sample content, not real information.</Text>
      </Container>
      <AboutView content={sampleAbout} />
    </>
  );
}
