import type { MetadataRoute } from "next";
import { buildRobots } from "@/lib/site/seo";

export default function robots(): MetadataRoute.Robots {
  return buildRobots(process.env);
}
