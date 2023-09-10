import { badgen } from 'badgen';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export const generateBadge = (
  coverage: number | null,
  label = 'coverage'
): string => {
  if (coverage === null) {
    return badgen({
      label: 'coverage',
      status: '❌', // This is the cross symbol
      color: 'grey',
      style: 'flat',
    });
  }

  const color =
    coverage >= 75
      ? 'green'
      : coverage >= 50
      ? 'yellow'
      : coverage >= 25
      ? 'orange'
      : 'red';

  return badgen({
    label: label,
    status: `${coverage.toFixed(2)}%`,
    color: color,
    style: 'flat',
  });
};

export const constructReadme = (localDir: string) => {
  const directories = fs
    .readdirSync(localDir)
    .filter(
      (d) =>
        fs.statSync(path.join(localDir, d)).isDirectory() &&
        fs.existsSync(`${localDir}/${d}/badges/${d}.svg`)
    );

  let readmeContent = '# CityMall Services Code Coverage\n\n';

  for (const directory of directories) {
    const serviceName = directory;

    const repoUrlFilePath = path.join(localDir, directory, '.repourl');
    let repoLink = '';
    if (fs.existsSync(repoUrlFilePath)) {
      repoLink = fs.readFileSync(repoUrlFilePath, 'utf-8').trim();
    }

    const subPackages = fs
      .readdirSync(`${localDir}/${directory}/badges`)
      .filter((f) => f !== `${directory}.svg`);

    readmeContent += `#### `;

    if (repoLink) {
      readmeContent += `<a href="${repoLink}">${serviceName}</a> `;
    } else {
      readmeContent += `${serviceName} `;
    }

    readmeContent += `<img style="padding-left: 10px;" src="./${directory}/badges/${directory}.svg" alt="Coverage[${directory}]" />\n\n`;

    if (subPackages.length > 1) {
      readmeContent +=
        '<details>\n<summary>package wise coverage</summary>\n<ul>\n';

      for (const subPackage of subPackages) {
        const subPackageName = subPackage
          .replace('.svg', '')
          .replace(/--SLASH--/g, '/');
        readmeContent += `<li><strong>${subPackageName}</strong> <img src="${directory}/badges/${subPackage}" alt="Coverage" /></li>\n`;
      }
      readmeContent += '</ul>\n</details>\n\n';
    }
  }

  fs.writeFileSync(`${localDir}/README.md`, readmeContent);
};

export const pushAllChangesToRepo = (localDir: string) => {
  const gitStatus = execSync('git status --porcelain', { cwd: localDir })
    .toString()
    .trim();
  if (gitStatus) {
    execSync('git add -A', { cwd: localDir });
    execSync('git commit -m "Update coverage badges"', { cwd: localDir });
    execSync('git push', { cwd: localDir });
  }
};
