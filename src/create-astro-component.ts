#! /usr/bin/env node

import fs from "fs";
import path from "path";
import util from "util";
import degit from "degit";

const mkdir = util.promisify(fs.mkdir);

async function run() {
  console.log("Creating astro component ...");

  const argv = process.argv;

  if (argv.length < 3) {
    console.error(
      "Not enough arguments. Need exactly one argument: the name of the component to create. (Will be used as the directory name as well.)"
    );
    process.exit(1);
  }

  if (argv.length > 3) {
    console.error(
      "Too many arguments. Need exactly one argument: the name of the component to create. (Will be used as the directory name as well.)"
    );
    process.exit(1);
  }

  const projectName = argv[2];

  try {
    await mkdir(projectName);
  } catch (err: any) {
    if (err.code == "EEXIST") {
      console.log(`Folder with name ${projectName} already exists.`);
      process.exit(1);
    }
  }

  process.chdir(projectName);

  const emitter = degit("astro-community/component-template", {
    cache: false,
    force: true,
    verbose: true,
  });

  try {
    await emitter.clone(process.cwd());

    const packageJSONPath = path.join(
      process.cwd(),
      "packages/new-package/package.json"
    );
    const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, "utf8"));

    const normalizedProjectName = projectName.toLowerCase().replace(" ", "-");
    packageJSON.name = normalizedProjectName;

    fs.writeFileSync(
      packageJSONPath,
      JSON.stringify(packageJSON, undefined, 2)
    );

    const oldComponentPath = path.join(
      process.cwd(),
      "packages/new-package/NewPackage.astro"
    );
    const newComponentPath = path.join(
      process.cwd(),
      "packages/new-package/",
      projectName
        .split(/\s|\-/)
        .map((word) => [word.charAt(0).toUpperCase(), ...word.slice(1)].join(""))
				.concat(".astro")
        .join("")
    );
    fs.renameSync(oldComponentPath, newComponentPath);

    const oldPackagePath = path.join(process.cwd(), "packages/new-package");
    const newPackagePath = path.join(
      process.cwd(),
      "packages/",
      normalizedProjectName
    );
    fs.renameSync(oldPackagePath, newPackagePath);
  } catch (err) {
    console.error(err);
  }
}

run();
