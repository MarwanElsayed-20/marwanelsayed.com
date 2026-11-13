import { Link } from "@/components/ui/link";
import { Section } from "@/components/ui/section";
import { Text } from "@/components/ui/text";
import type { ProfileLink } from "@/content/site/types";

type ContactViewProps = {
  /** The supplied email address (the page counts as supplied only when this exists). */
  email: string;
  /** Optional public profile links. Empty means the "Elsewhere" section is omitted. */
  profiles: readonly ProfileLink[];
};

/** The supplied Contact section: an email address as readable text and a link. No form, no scripts. */
export function ContactView({ email, profiles }: ContactViewProps) {
  return (
    <Section id="contact" tabIndex={-1} heading="Contact" intro="Get in touch by email.">
      <Section headingLevel={3} heading="Email" width="reading">
        <Text variant="lead">
          <Link href={`mailto:${email}`}>{email}</Link>
        </Text>
      </Section>
      {profiles.length > 0 ? (
        <Section headingLevel={3} heading="Elsewhere" width="reading">
          <ul className="flex flex-col gap-3">
            {profiles.map((profile) => (
              <li key={profile.url}>
                <Link href={profile.url}>{profile.label}</Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </Section>
  );
}
