import type { SceneTone } from "../../lib/contrast";

export type SelectedWorkScene = {
  /** Also the scene's colour tokens (`--color-scene-<id>-*`) and its anchor (`#scene-<id>`). */
  id: SceneTone;
  name: string;
  /** Short name for the tab bar. */
  tab: string;
  /** The area it belongs to, then what it is: "01 / SaaS & Dashboards / Headless commerce". */
  label: readonly [string, string];
  summary: string;
  /** Case-study links by project slug. One scene can stand for a family of projects. */
  links: readonly { label: string; project: string }[];
  /** Captures by project slug and screen path. The first is the large one at the edge. */
  captures: readonly { project: string; src: string }[];
  /** Two small labels in the artwork: what it is, and the flow it carries. */
  captions: { topic: string; flow: string };
};

/**
 * Selected work: four scenes in this order, ToolSwift as its whole
 * ecosystem. Labels come from the CV facts in the project records; captions only name features
 * those records describe. No live-product links (none are supplied).
 */
export const selectedWorkContent = {
  heading: "Selected work",
  introduction:
    "A headless commerce platform, an ERP, a clear-aligner case platform and a platform that connects students with companies. Scroll through, or open any of them.",
  /** The button under the introduction: the full list of case studies. */
  action: { label: "View all work", href: "/work" },
  scenes: [
    {
      id: "toolswift",
      name: "ToolSwift",
      tab: "ToolSwift",
      label: ["SaaS & Dashboards", "Headless commerce"],
      summary:
        "A headless commerce platform with a merchant admin interface and a B2B customer portal.",
      links: [
        { label: "Customer portal", project: "toolswift-customer-dashboard" },
        { label: "Admin platform", project: "toolswift-admin-platform" },
        { label: "Marketing site", project: "toolswift-marketing" },
      ],
      captures: [
        {
          project: "toolswift-customer-dashboard",
          src: "/projects/toolswift-customer-dashboard/screens/01-overview.png",
        },
        {
          project: "toolswift-admin-platform",
          src: "/projects/toolswift-admin-platform/screens/01-dashboard.png",
        },
        {
          project: "toolswift-marketing",
          src: "/projects/toolswift-marketing/screens/01-home.png",
        },
      ],
      captions: { topic: "Admin · Portal · Marketing", flow: "Catalogue to payment" },
    },
    {
      id: "smooth-erp",
      name: "Smooth ERP",
      tab: "Smooth ERP",
      label: ["SaaS & Dashboards", "ERP system"],
      summary:
        "A multi-company ERP in Arabic and English: point of sale, inventory, accounting and projects, with access set per screen and action.",
      links: [{ label: "Read case study", project: "smooth-erp" }],
      captures: [
        { project: "smooth-erp", src: "/projects/smooth-erp/screens/05-pos-checkout.png" },
        { project: "smooth-erp", src: "/projects/smooth-erp/screens/08-profit-loss-ar.png" },
        { project: "smooth-erp", src: "/projects/smooth-erp/screens/01-module-home.png" },
      ],
      captions: { topic: "POS · Inventory · Accounting", flow: "Arabic ⇄ English" },
    },
    {
      id: "aligna",
      name: "Aligna",
      tab: "Aligna",
      label: ["SaaS & Dashboards", "Clear-aligner cases"],
      summary:
        "A case-management platform for a clear-aligner lab, with a case wizard, live case progress, a dashboard for each role and real-time chat.",
      links: [{ label: "Read case study", project: "aligna" }],
      captures: [
        { project: "aligna", src: "/projects/aligna/screens/01-dashboard.png" },
        { project: "aligna", src: "/projects/aligna/screens/03-case-progress.png" },
      ],
      captions: { topic: "Real-time chat per case", flow: "Prescription → Uploads → Shipping" },
    },
    {
      id: "wajihni",
      name: "Wajihni",
      tab: "Wajihni",
      label: ["SaaS & Dashboards", "Internships and training"],
      summary:
        "A platform where companies publish training programs and internships, students apply, and companies decide.",
      links: [{ label: "Read case study", project: "wajihni" }],
      captures: [
        { project: "wajihni", src: "/projects/wajihni/screens/04-programs-filter.png" },
        { project: "wajihni", src: "/projects/wajihni/screens/09-applicants.png" },
      ],
      captions: { topic: "Student ⇄ Company", flow: "Pending → Accepted" },
    },
  ],
} as const satisfies {
  heading: string;
  introduction: string;
  action: { label: string; href: string };
  scenes: readonly SelectedWorkScene[];
};
