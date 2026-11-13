import type { ResolvedScene } from "@/lib/projects/selected-work";
import { AlignaArt } from "./aligna";
import { SmoothErpArt } from "./smooth-erp";
import { ToolSwiftArt } from "./toolswift";
import { WajihniArt } from "./wajihni";

/** Each scene's own artwork, drawn from that product's real interface and visual language. */
export function SceneArt({ scene }: { scene: ResolvedScene }) {
  switch (scene.id) {
    case "toolswift":
      return <ToolSwiftArt scene={scene} />;
    case "smooth-erp":
      return <SmoothErpArt scene={scene} />;
    case "aligna":
      return <AlignaArt scene={scene} />;
    case "wajihni":
      return <WajihniArt scene={scene} />;
  }
}
