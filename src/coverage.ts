import { execSync } from "child_process";
import fs from "fs";
import { goCoverage } from "./goCoverage";
import config from "config";
import { constructReadme, pushAllChangesToRepo } from "./common";
import { nodeCoverage } from "./nodeCoverage";
import { pythonCoverage } from "./pythonCoverage";

const TOKEN: string = config.get("GITHUB_TOKEN");

export const coverageBadge = async () => {
  const localDir = "./public-badges-repo";
  if (!fs.existsSync(localDir)) {
    execSync(
      `git clone https://${TOKEN}@github.com/city-mall/public-badges.git ${localDir}`
    );
  } else {
    execSync(`git pull`, { cwd: localDir });
  }
  await goCoverage(localDir, TOKEN);
  await nodeCoverage(localDir, TOKEN);
  await pythonCoverage(localDir, TOKEN);

  constructReadme(localDir);
  pushAllChangesToRepo(localDir);
  execSync(`rm -rf ${localDir}`);
};

// coverageBadge();
