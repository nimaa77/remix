import * as fs from "fs";
import * as path from "path";
import resolvePkg from "resolve-package-path";

import type { RemixConfig } from "../config";

type PackageDependencies = { [packageName: string]: string };

export function getPackageDependencies(
  packageJsonFile: string
): PackageDependencies {
  let pkg = JSON.parse(fs.readFileSync(packageJsonFile, "utf8"));
  return pkg?.dependencies || {};
}

export function getAppDependencies(config: RemixConfig): PackageDependencies {
  return getPackageDependencies(
    path.resolve(config.rootDirectory, "package.json")
  );
}

export function getDependenciesToBundle(...pkg: string[]): string[] {
  let aggregatedDeps = new Set<string>(pkg);
  let visitedPackages = new Set<string>();

  pkg.forEach((p) => {
    getPackageDependenciesRecursive(p, aggregatedDeps, visitedPackages);
  });

  return Array.from(aggregatedDeps);
}

function getPackageDependenciesRecursive(
  pkg: string,
  aggregatedDeps: Set<string>,
  visitedPackages: Set<string>
): void {
  visitedPackages.add(pkg);

  let pkgJson = resolvePkg(pkg, ".");

  if (!pkgJson) {
    console.log(`Could not find package.json for ${pkg}`);
    return;
  }

  let dependencies = getPackageDependencies(pkgJson);

  Object.keys(dependencies).forEach((dep) => {
    aggregatedDeps.add(dep);
    if (!visitedPackages.has(dep)) {
      getPackageDependenciesRecursive(dep, aggregatedDeps, visitedPackages);
    }
  });
}
