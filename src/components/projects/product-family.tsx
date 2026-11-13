import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import type { FamilyView } from "@/lib/projects/families";
import { PreviewFrame } from "./preview-frame";

/** Static cross-project context, deliberately outside the case-study outline. */
export function ProductFamily({ family, number }: { family?: FamilyView; number?: string }) {
  if (!family) return null;
  return (
    <section aria-labelledby="product-family-heading" className="case-scene case-family">
      <Container>
        <div className="case-chapter" data-reveal="scene">
          <span aria-hidden="true" className="case-chapter-no">
            {number ?? "+"}
          </span>
          <span className="case-chapter-label">One product, several parts</span>
          <h2 id="product-family-heading" className="case-chapter-title">
            Part of {family.name}
          </h2>
        </div>
        <div className="case-body">
          {family.story?.length ? (
            <div className="case-copy" data-reveal="scene">
              {family.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          <nav aria-label={`${family.name} projects`}>
            <ul className="case-family-list" data-reveal="stagger">
              {family.members.map((member) => {
                const content = (
                  <>
                    <PreviewFrame
                      title={member.title}
                      image={member.image}
                      sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw"
                    />
                    <span className="case-family-name">{member.title}</span>
                    <span className="case-family-part">{member.part}</span>
                    {member.current ? <span className="case-family-here">You are here</span> : null}
                  </>
                );
                const className = "case-family-member";
                return (
                  <li key={member.slug} className="min-w-0">
                    {member.current ? (
                      <div aria-current="page" className={className}>
                        {content}
                      </div>
                    ) : (
                      <Link href={member.href} variant="standalone" className={className}>
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </Container>
    </section>
  );
}
