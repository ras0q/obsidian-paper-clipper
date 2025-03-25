import manifest from "../manifest.json" with { type: "json" };
import { format, increment, parse, ReleaseType } from "@std/semver";
import { join } from "node:path";

if (import.meta.main) {
  const type = Deno.args[0];

  const releaseType = (type ?? "patch") as ReleaseType;
  manifest.version = format(increment(parse(manifest.version), releaseType));

  await Deno.writeTextFile(
    join(import.meta.dirname!, "../manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );

  console.log(
    `%cBumped version to ${manifest.version} (${releaseType})\n` +
      "Next steps:\n",
    "color: green;",
  );
  console.log(
    "%cgit add manifest.json\n" +
      `git commit -m "Bump to ${manifest.version}"\n` +
      `git tag ${manifest.version}\n` +
      "git push origin main --tags",
    "color: blue;",
  );
}
