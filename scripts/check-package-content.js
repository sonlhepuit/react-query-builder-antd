const { spawnSync } = require("child_process");

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const result = spawnSync(
  npmCommand,
  ["pack", "--dry-run", "--json", "--ignore-scripts"],
  { encoding: "utf8" }
);

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status || 1);
}

const report = JSON.parse(result.stdout);
const files = report[0].files.map(({ path }) => path);
const allowedRoots = new Set([
  "lib",
  "modules",
  "css",
  "README.md",
  "package.json",
  "LICENSE",
  "LICENSE.md",
  "LICENSE.txt",
]);
const unexpectedFiles = files.filter((file) => {
  const root = file.split("/")[0];
  return !allowedRoots.has(root);
});

if (unexpectedFiles.length > 0) {
  console.error("Unexpected files in npm package:");
  unexpectedFiles.forEach((file) => console.error("- " + file));
  process.exit(1);
}

console.log("Package contents verified: " + files.length + " files");
