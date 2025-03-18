import manifest from "../manifest.json" with { type: "json" };
import { format, increment, parse, ReleaseType } from "@std/semver";
import { join } from "node:path";

if (import.meta.main) {
  const type = Deno.args[0];

  const releaseType = (type ?? "patch") as ReleaseType;
  manifest.version = format(increment(parse(manifest.version), releaseType));
  console.log(manifest.version);

  await Deno.writeTextFile(
    join(import.meta.dirname!, "../manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
}
