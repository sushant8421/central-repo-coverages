import fetch from "node-fetch";
import lcovParse from "lcov-parse";
import * as fs from "fs";
import * as path from "path";
import { generateBadge } from "./common";

const NODE_REPO_MAP: {
  [repoKey: string]: { url: string; repoLink: string };
} = {
  "pq-heaps-ts": {
    url: "https://api.github.com/repos/sushant8421/pq-heaps-ts/git/trees/node-coverage-reports:coverage?recursive=1",
    repoLink: "https://github.com/sushant8421/pq-heaps-ts",
  },
};

interface CoverageData {
  lines: {
    found: number;
    hit: number;
  };
  functions: {
    found: number;
    hit: number;
  };
  branches: {
    found: number;
    hit: number;
  };
}

interface PackageCoverage {
  name: string;
  coverage: AggregateCoverage;
}

interface AggregateCoverage {
  overall: number;
  line: number;
  function: number;
  branch: number;
  files: number;
}

function computeCoverage(data: CoverageData[]): AggregateCoverage {
  let totalLinesFound = 0;
  let totalLinesHit = 0;
  let totalFunctionsFound = 0;
  let totalFunctionsHit = 0;
  let totalBranchesFound = 0;
  let totalBranchesHit = 0;

  data.forEach((item) => {
    totalLinesFound += item.lines.found;
    totalLinesHit += item.lines.hit;
    totalFunctionsFound += item.functions.found;
    totalFunctionsHit += item.functions.hit;
    totalBranchesFound += item.branches.found;
    totalBranchesHit += item.branches.hit;
  });

  const lineCoverage = (totalLinesHit / totalLinesFound) * 100;
  const functionCoverage = (totalFunctionsHit / totalFunctionsFound) * 100;
  const branchCoverage = totalBranchesFound
    ? (totalBranchesHit / totalBranchesFound) * 100
    : 100;

  return {
    line: lineCoverage,
    function: functionCoverage,
    branch: branchCoverage,
    overall: (lineCoverage + functionCoverage + branchCoverage) / 3,
    files: data.length,
  };
}

const parseLcov = async (lcovString: string): Promise<CoverageData[]> =>
  new Promise((resolve, reject) =>
    lcovParse(lcovString, (err, data) => (err ? reject(err) : resolve(data!)))
  );

interface LcovFile {
  path: string;
  url: string;
}

async function fetchCoverageFromRepo(TOKEN: string): Promise<{
  [repoKey: string]: {
    packages: PackageCoverage[];
    overallLineCoverage: number;
  };
}> {
  let packageCoverages: {
    [repoKey: string]: {
      packages: PackageCoverage[];
      overallLineCoverage: number;
    };
  } = {};

  for (const repoKey in NODE_REPO_MAP) {
    const repoUrl = NODE_REPO_MAP[repoKey].url;

    const response = await fetch(repoUrl, {
      headers: {
        Authorization: `token ${TOKEN}`,
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch directory structure: ${response.statusText}`
      );
      return packageCoverages;
    }

    const data = (await response.json()) as any;
    const lcovFiles: LcovFile[] = data.tree.filter((file: LcovFile) =>
      file.path.endsWith("lcov.info")
    );

    let weightedLineCoverageSum = 0;
    let totalLinesInRepo = 0;

    for (const file of lcovFiles) {
      const fileContent = await fetch(file.url, {
        headers: {
          Authorization: `token ${TOKEN}`,
          Accept: "application/vnd.github.v3.raw",
        },
      })
        .then((res) => res.text())
        .catch(console.error);

      if (!fileContent) {
        console.error(`Failed to fetch file: ${file.url}`);
        continue;
      }

      const lcovData = await parseLcov(fileContent);
      const coverage = computeCoverage(lcovData);

      weightedLineCoverageSum += coverage.line * coverage.files;
      totalLinesInRepo += coverage.files;

      const packageName = file.path.split("/").slice(-2, -1)[0];

      if (!packageCoverages[repoKey]) {
        packageCoverages[repoKey] = {
          packages: [],
          overallLineCoverage: 0,
        };
      }

      packageCoverages[repoKey].packages.push({
        name: packageName,
        coverage: {
          ...coverage,
          overall: (coverage.line + coverage.function + coverage.branch) / 3,
        },
      });
    }

    packageCoverages[repoKey].overallLineCoverage =
      weightedLineCoverageSum / totalLinesInRepo;
  }

  return packageCoverages;
}

export const nodeCoverage = async (
  localDir: string,
  TOKEN: string
): Promise<void> => {
  try {
    const coveragesByRepo = await fetchCoverageFromRepo(TOKEN);

    for (const repoKey in coveragesByRepo) {
      const repoDir = path.join(localDir, repoKey, "badges");
      if (!fs.existsSync(repoDir)) {
        fs.mkdirSync(repoDir, { recursive: true });
      }

      console.info(
        `Generating badges for ${repoKey}: ${coveragesByRepo[repoKey].overallLineCoverage}`
      );
      // Generate badge for overall repo line coverage
      const svgContent = generateBadge(
        coveragesByRepo[repoKey].overallLineCoverage
      );
      fs.writeFileSync(path.join(repoDir, `${repoKey}.svg`), svgContent);

      fs.writeFileSync(
        path.join(localDir, repoKey, ".repourl"),
        NODE_REPO_MAP[repoKey].repoLink
      );

      // Loop through each package in the repo and save its line coverage as a badge
      for (const pkgCoverage of coveragesByRepo[repoKey].packages) {
        const pkgBadgeName = pkgCoverage.name.replace(/\//g, "--SLASH--");
        console.info(
          `Generating badge for ${pkgCoverage.name}: ${pkgCoverage.coverage.line}`
        );
        const pkgSvgContent = generateBadge(pkgCoverage.coverage.line);
        fs.writeFileSync(
          path.join(repoDir, `${pkgBadgeName}.svg`),
          pkgSvgContent
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// nodeCoverage('./public-badges-repo', config.get('GITHUB_TOKEN'));
