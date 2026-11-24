import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const IMAGE_NAME = "entry.png";
const STORIES_NAME = "stories.json";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

interface Artifact {
  name: string;
  source: URL;
  destination: string;
}

function resolveArtifacts(): Artifact[] {
  return [IMAGE_NAME, STORIES_NAME].map((name) => ({
    name,
    source: new URL(`./${name}`, import.meta.url),
    destination: `${OUTPUT_DIR}/${name}`,
  }));
}

function prepareOutputDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

function copyEntry(artifact: Artifact): void {
  copyFileSync(artifact.source, artifact.destination);
}

function sha256Of(path: string | URL): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function verifyOutput(artifacts: Artifact[]): void {
  for (const artifact of artifacts) {
    const sourceHash = sha256Of(artifact.source);
    const destinationHash = sha256Of(artifact.destination);
    if (sourceHash !== destinationHash) {
      throw new Error(
        `verify failed for ${artifact.name}: ${destinationHash} != ${sourceHash}`,
      );
    }
  }
}

function main(): void {
  const artifacts = resolveArtifacts();
  prepareOutputDir(OUTPUT_DIR);
  for (const artifact of artifacts) {
    copyEntry(artifact);
  }
  verifyOutput(artifacts);
}

main();
