#! /usr/bin/env node

import fs from "fs";
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
	} catch (err) {
		console.error(err);
	}
}

run();
