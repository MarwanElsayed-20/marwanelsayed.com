import { ContactView } from "@/components/site/contact-view";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { sampleContact } from "@/content/site/review-samples";

export default function ReviewContactPage() {
  return (
    <>
      <Container className="pt-6">
        <Text variant="small">Review page: synthetic sample content, not real information.</Text>
      </Container>
      <ContactView email={sampleContact.email} profiles={sampleContact.profiles} />
    </>
  );
}
