import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { generateBadge } from "./common";
// import config from 'config';

const GO_REPO_MAP: {
  [repoKey: string]: { url: string; pathDepthLimit: number; repoLink: string };
} = {
  "go-basics": {
    url: "https://raw.githubusercontent.com/sushant8421/go-basics/go-coverage-reports/coverage.out",
    pathDepthLimit: 5,
    repoLink: "https://github.com/sushant8421/go-basics",
  },
};

function computeCoveragePercentage(
  content: string,
  pathDepthLimit: number
): {
  overall: number;
  packages: { [packageName: string]: number };
} {
  const lines = content.split("\n").filter((line) => !line.startsWith("mode:"));

  let totalStatements = 0;
  let totalCovered = 0;
  const packages: {
    [packageName: string]: { total: number; covered: number };
  } = {};

  for (const line of lines) {
    const parts = line.split(" ");

    if (parts.length < 3) continue;

    const filePathParts = parts[0].split("/");
    const adjustedPathParts = filePathParts.slice(0, pathDepthLimit + 1);

    const packageName = adjustedPathParts.slice(0, -1).join("/");

    const statements = parseInt(parts[parts.length - 2], 10);
    const covered = parseInt(parts[parts.length - 1], 10);

    if (isNaN(statements) || isNaN(covered)) continue;

    if (!packages[packageName]) {
      packages[packageName] = { total: 0, covered: 0 };
    }

    totalStatements += statements;
    packages[packageName].total += statements;

    if (covered > 0) {
      totalCovered += statements;
      packages[packageName].covered += statements;
    }
  }

  const packageCoverage: { [packageName: string]: number } = {};
  for (const [name, data] of Object.entries(packages)) {
    packageCoverage[name] = (data.covered / data.total) * 100;
  }

  return {
    overall: (totalCovered / totalStatements) * 100,
    packages: packageCoverage,
  };
}

async function fetchCoverageFromRepo(
  repoUrl: string,
  pathDepthLimit: number,
  TOKEN: string
) {
  if (!TOKEN) {
    console.error("GitHub token is not set.");
    return null;
  }

  const response = await fetch(repoUrl, {
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });

  if (response.ok) {
    const content = await response.text();
    return computeCoveragePercentage(content, pathDepthLimit);
  } else {
    console.info(
      `Failed to fetch coverage from ${repoUrl}. HTTP Status: ${response.status}`
    );
    return null;
  }
}

export const goCoverage = async (
  localDir: string,
  TOKEN: string
): Promise<void> => {
  for (const [repoKey, repoConfig] of Object.entries(GO_REPO_MAP)) {
    const coverageData = await fetchCoverageFromRepo(
      repoConfig.url,
      repoConfig.pathDepthLimit,
      TOKEN
    );

    if (coverageData) {
      console.info(
        `Overall coverage for ${repoConfig.url}: ${coverageData.overall.toFixed(
          2
        )}%`
      );
      for (const [packagePath, packageCoverage] of Object.entries(
        coverageData.packages
      )) {
        console.info(
          `Coverage for ${packagePath}: ${packageCoverage.toFixed(2)}%`
        );
      }

      const badgePath = `${localDir}/${repoKey}/badges/${repoKey}.svg`;

      const directoryPath = path.dirname(badgePath);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const svgContent = generateBadge(coverageData.overall);
      fs.writeFileSync(badgePath, svgContent);

      for (const [subPackageName, subPackageCoverage] of Object.entries(
        coverageData.packages
      )) {
        const subPackageBadgeName = subPackageName
          .replace(/^github\.com\//, "")
          .replace(/\//g, "--SLASH--");

        const subPackageBadgePath = `${localDir}/${repoKey}/badges/${subPackageBadgeName}.svg`;
        const subPackageSvgContent = generateBadge(
          subPackageCoverage,
          "coverage"
        );
        fs.writeFileSync(subPackageBadgePath, subPackageSvgContent);
      }
    }
    // else generate a coverage badge with 0 coverage for the repo
    else {
      console.info(`No coverage data found for ${repoConfig.url}`);
      const badgePath = `${localDir}/${repoKey}/badges/${repoKey}.svg`;
      const directoryPath = path.dirname(badgePath);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const svgContentZeroCoverage = generateBadge(null); // Assuming 0 represents 0% coverage
      fs.writeFileSync(badgePath, svgContentZeroCoverage);
    }

    fs.writeFileSync(
      path.join(localDir, repoKey, ".repourl"),
      GO_REPO_MAP[repoKey].repoLink
    );
  }
};

// goCoverage('./public-badges-repo', config.get('GITHUB_TOKEN'));
