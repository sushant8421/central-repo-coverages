import fetch from "node-fetch";
import * as fs from "fs";
import * as path from "path";
import { generateBadge } from "./common";
// import config from "config";

type RepoMap = {
  [key: string]: {
    url: string;
    repoLink: string;
  };
};

const PYTHON_REPO_MAP: RepoMap = {
  "cohortx-v2": {
    url: "https://api.github.com/repos/sushant8421/learning-python/git/trees/python-coverage-reports:coverage?recursive=1",
    repoLink: "https://github.com/sushant8421/learning-python",
  },
};

interface CoverageData {
  overall?: number;
  details?: { [module: string]: number };
}

async function fetchCoverageDataFromRepo(
  repoUrl: string,
  TOKEN: string
): Promise<{ [fileName: string]: CoverageData }> {
  const response = await fetch(repoUrl, {
    headers: {
      Authorization: `token ${TOKEN}`,
    },
  });

  if (!response.ok) {
    console.error(
      `Failed to fetch directory structure: ${response.statusText}`
    );
    return {};
  }

  const data = (await response.json()) as any;
  const txtFiles: { path: string; url: string }[] = data.tree.filter(
    (file: { path: string }) => file.path.endsWith(".txt")
  );

  let coverages: { [fileName: string]: CoverageData } = {};

  for (const file of txtFiles) {
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

    const lines = fileContent.trim().split("\n");
    const overallCoverageLine = lines[lines.length - 1];
    const overallCoverageMatch = overallCoverageLine.match(/(\d+)%/);

    if (!overallCoverageMatch) {
      console.error(
        `Failed to extract overall coverage data from: ${file.path}`
      );
      continue;
    }

    const overallCoverage = parseFloat(overallCoverageMatch[1]);
    const fileName = path.basename(file.path, ".txt");

    const moduleCoverageDetails: { [module: string]: number } = {};

    const dataLines = lines.slice(1, lines.length - 2);
    for (const line of dataLines) {
      const moduleMatch = line.match(/^([\w\/_\-\.]+)\s+\d+\s+\d+\s+(\d+)%/);
      if (moduleMatch) {
        const moduleName = moduleMatch[1].trim();
        const moduleCoverage = parseFloat(moduleMatch[2]);
        moduleCoverageDetails[moduleName] = moduleCoverage;
      }
    }

    coverages[fileName] = {
      overall: overallCoverage,
      details: moduleCoverageDetails,
    };
  }

  return coverages;
}

export const pythonCoverage = async (
  localDir: string,
  TOKEN: string
): Promise<void> => {
  try {
    for (const repoKey in PYTHON_REPO_MAP) {
      const coverages = await fetchCoverageDataFromRepo(
        PYTHON_REPO_MAP[repoKey].url,
        TOKEN
      );

      const repoDir = path.join(localDir, repoKey, "badges");
      if (!fs.existsSync(repoDir)) {
        fs.mkdirSync(repoDir, { recursive: true });
      }

      let overallCoverageSum = 0;
      let totalFiles = 0;

      for (const fileName in coverages) {
        const fileCoverage = coverages[fileName];
        if (fileCoverage && typeof fileCoverage.overall === "number") {
          // Generate badge for the individual package's overall coverage
          console.info(
            `Generating badges for ${fileName}: ${fileCoverage.overall}`
          );
          const svgContent = generateBadge(fileCoverage.overall);
          fs.writeFileSync(path.join(repoDir, `${fileName}.svg`), svgContent);

          overallCoverageSum += fileCoverage.overall;
          totalFiles++;
        }
      }

      const averageOverallCoverage = overallCoverageSum / totalFiles || 0;
      console.info(
        `Generating overall badge for ${repoKey}: ${averageOverallCoverage.toFixed(
          2
        )}`
      );
      const overallSvgContent = generateBadge(averageOverallCoverage);
      fs.writeFileSync(path.join(repoDir, `${repoKey}.svg`), overallSvgContent);

      fs.writeFileSync(
        path.join(localDir, repoKey, ".repourl"),
        PYTHON_REPO_MAP[repoKey].repoLink
      );
    }
  } catch (error) {
    console.error(error);
  }
};

// pythonCoverage('./public-badges-repo', config.get('GITHUB_TOKEN'));
