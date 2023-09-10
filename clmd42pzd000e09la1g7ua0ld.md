---
title: "CityMall's Unified Code Coverage: Crafting Dynamic Badges for Multi-Language Repositories"
datePublished: Sun Sep 10 2023 07:06:03 GMT+0000 (Coordinated Universal Time)
cuid: clmd42pzd000e09la1g7ua0ld
slug: citymalls-unified-code-coverage-crafting-dynamic-badges-for-multi-language-repositories
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1694329235046/74a0070b-1660-46b6-a864-f5151faf7f62.png
ogImage: https://cdn.hashnode.com/res/hashnode/image/upload/v1694329538543/63ab5dae-a6bf-4c01-a432-0d699e49e97b.png
tags: unit-testing, code-coverage, ci-cd, github-actions-1

---

At CityMall, ensuring the robustness of our codebase isn't just a goal—it's a relentless pursuit. We understand the need for clarity regarding our code's health and quality. But how do we give our contributors and users real-time insight into the state of our code? Our innovative solution is dynamic code coverage badges. These badges don't just serve as visual aesthetics; they reflect the real-time health of our codebase, offering an immediate and transparent metric of our commitment to excellence. Curious to see this in action? Explore our [GitHub webpage](https://city-mall.github.io/public-badges/) to get a clear picture of our expected behavior and how these dynamic badges bring our commitment to life. Complete Code for implementing this can be found at [Github Repo Link](https://github.com/sushant8421/central-repo-coverages), Simply adjust the provided code to suit your requirements, and voilà, you'll be set to generate coverages for your repositories.

### **1\. Preparing Your Repository for Coverage Data**

Every programming language has its nuances. Thus, configure each service accordingly:

#### **a. Golang Repositories:**

*For the Go enthusiasts ensuring concurrency in every application:*

1. Initialize a GitHub Action workflow for unit tests.
    
2. Activate the workflow on the `master` and `staging` branches.
    
3. Set up the Go environment, execute tests, and push the coverage data to a dedicated branch.
    

```yml
name: Go
on:
  push:
    branches:
      - master
      - staging
jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Set up Go
        uses: actions/setup-go@v2
        with:
          go-version: ^1.15

      - name: Checkout code
        uses: actions/checkout@v2

      - name: Run tests with coverage
        run: go test ./... -coverprofile=coverage.out

      - name: Push coverage data to branch
        run: |
          git checkout -b go-coverage-reports
          git add coverage.out
          git commit -m "Update Go coverage data"
          git push origin go-coverage-reports
```

#### **b. Node.js Repositories:**

*Embracing the dynamic world of JavaScript:*

1. Implement a GitHub Action workflow for Node.js.
    
2. Trigger the workflow on primary branches.
    
3. Install dependencies, run tests, and commit the coverage data.
    

```yml
name: Node.js Tests

on:
  push:
    branches: [master, develop]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: 16.x
          cache: 'npm'
      
      - name: Install Dependencies & Run Tests
        run: |
          npm ci
          npm run test:aggregate

      - name: Push coverage data to branch
        run: |
          git checkout -b node-coverage-reports
          git add coverage/lcov.info
          git commit -m "Update Node.js coverage data"
          git push origin node-coverage-reports
```

#### **c. Python Repositories:**

*Making sure every Python script remains as fierce as its namesake:*

1. Design a GitHub Action workflow for Python.
    
2. Trigger the workflow for the `master` branch.
    
3. Set up the environment, handle dependencies, execute tests, and commit the reports.
    

```yml
name: Python Tests

on:
  push:
    branches: [master]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.8

      - name: Install Dependencies & Run Tests
        run: |
          pip install -r requirements.txt
          pip install coverage
          # Execute your test commands here
          # For example: coverage run --source=. -m unittest

      - name: Push coverage reports to new branch
        run: |
          git checkout -b python-coverage-reports
          git add coverage/
          git commit -m "Add Python coverage reports"
          git push origin python-coverage-reports
```

### **2\. Updating Your Repository's Coverage**

Different language scripts to fetch, parse, and update badges:

**Summaries:**

#### **Go:**

1. `fetch` the `cover.out` files.
    
2. Extract the coverage percentage.
    
3. Generate and store badge SVGs.
    

#### **NodeJS:**

1. `fetch` the [`lcov.info`](http://lcov.info) files.
    
2. Extract data using `lcov-parse`.
    
3. Compute aggregate coverage percentages.
    
4. Design and save badge SVGs.
    

#### **Python:**

1. `fetch` the `.txt` coverage files.
    
2. Extract coverage percentages.
    
3. Create and save the badge SVGs.
    

### **Structured Approach:**

**Central Function:** [**<mark>coverageBadge</mark>**](https://github.com/sushant8421/central-repo-coverages/blob/main/src/coverage.ts)

Let's break down the main function that orchestrates the entire process.

```javascript
import { execSync } from 'child_process';
import fs from 'fs';
import { goCoverage } from './goCoverage';
import config from 'config';
import { constructReadme, pushAllChangesToRepo } from './common';
import { nodeCoverage } from './nodeCoverage';
import { pythonCoverage } from './pythonCoverage';

const TOKEN: string = config.get('GITHUB_TOKEN');

export const coverageBadge = async () => { ... };
```

**Modules & Imports**

* **execSync from child\_process**: A Node.js method that allows the execution of shell commands synchronously. This is used to run git commands.
    
* **fs**: The Node.js file system module, is used to interact with the local file system.
    
* **goCoverage, nodeCoverage, pythonCoverage**: Separate modules that handle coverage badge generation for Go, Node.js, and Python projects respectively.
    
* **config**: A configuration manager for Node.js. It's used to securely fetch the GitHub token.
    
* **constructReadme and pushAllChangesToRepo from common**: Utility functions that construct a README file with the new badges and then push all changes to the centralized repository.
    

**Function Breakdown:** `coverageBadge`

1. **Setting Up the Local Directory**
    

```javascript
const localDir = './public-badges-repo';
if (!fs.existsSync(localDir)) {
  execSync(`git clone https://${TOKEN}@github.com/city-mall/public-badges.git ${localDir}`);
} else {
  execSync(`git pull`, { cwd: localDir });
}
```

Here, the function first checks if the directory (`public-badges-repo`) exists. If not, it clones the centralized repository. If it already exists, it simply pulls the latest changes.

1. **Generating Coverage Badges for Different Projects**
    

```javascript
await goCoverage(localDir, TOKEN);
await nodeCoverage(localDir, TOKEN);
await pythonCoverage(localDir, TOKEN);
```

This sequence of commands will generate coverage badges for Go, Node.js, and Python projects. Each function is awaited, ensuring they run sequentially.

1. **Constructing the README and Pushing Changes**
    

```javascript
constructReadme(localDir);
pushAllChangesToRepo(localDir);
```

After all the badges have been generated, the function constructs (or updates) the README file of the repository. It then pushes all the changes to the GitHub repository.

1. **Cleaning Up**
    

```javascript
execSync(`rm -rf ${localDir}`);
```

### **Module Breakdown:** [**<mark>goCoverage</mark>**](https://github.com/sushant8421/central-repo-coverages/blob/main/src/goCoverage.ts)

The `goCoverage` module is responsible for generating coverage badges for Go-based projects. Let's explore its functions and processes step-by-step.

```javascript
import fetch from 'node-fetch';
import { generateBadge } from './common';

const GO_REPO_MAP = { ... };

async function fetchCoverageFromRepo(TOKEN: string) { ... }

export const goCoverage = async (localDir: string, TOKEN: string) => { ... };
```

**Modules & Imports**

* **node-fetch**: A light-weight module that brings the `fetch` API to Node.js. It is used to make HTTP requests, in this case, fetching coverage data from the GitHub repository.
    
* **generateBadge from common**: A utility function from the common module that takes coverage percentages and returns the corresponding badge (probably as an SVG or a link).
    

**GO\_REPO\_MAP**

It's an object that maps specific Go-based repository keys to their respective URLs and links. This is utilized to keep track of which Go repos to fetch coverage details from.

**Function: fetchCoverageFromRepo(TOKEN)**

This function seems to handle the core logic of fetching and processing coverage details from the GitHub repositories.

1. **Fetching Repository Data**
    

The function iterates over the repositories specified in `GO_REPO_MAP`, making authenticated requests to the GitHub API using the provided token (`TOKEN`).

1. **Parsing Coverage Data**
    

After fetching the coverage data (probably in a format like coverage.out, LCOV or something similar), it processes this data to calculate the coverage percentage.

**Main Function: goCoverage(localDir, TOKEN)**

This is the main orchestrator for the Go coverage badge generation.

1. **Fetching Coverage Data**
    

It first invokes the `fetchCoverageFromRepo` function, fetching the coverage data from the specified Go repositories.

1. **Generating Badges**
    

After retrieving and processing the coverage data, it utilizes the `generateBadge` utility function to create badges based on the calculated coverage percentages.

1. **Local Repository Updates**
    

The generated badges are then written to the local clone of the centralized badges repository (`public-badges-repo`), ready to be pushed to GitHub.

In summary, the `goCoverage` module manages Go projects' coverage badge generation by:

1. Fetching coverage data from specified Go repositories.
    
2. Calculating coverage percentages based on the retrieved data.
    
3. Generating badges using a common utility function.
    
4. Updating the local clone of the centralized badge repository with the new badges.
    

### **Module Breakdown:** [**nodeCoverage**](https://github.com/sushant8421/central-repo-coverages/blob/main/src/nodeCoverage.ts)

The `nodeCoverage` module is designed to generate coverage badges specifically for Node.js projects. Let's break down its functionalities:

```javascript
import fetch from 'node-fetch';
import lcovParse from 'lcov-parse';
import * as fs from 'fs';
import * as path from 'path';
import { generateBadge } from './common';

const NODE_REPO_MAP = { ... };

interface CoverageData { ... }
interface PackageCoverage { ... }
interface AggregateCoverage { ... }

function computeCoverage(data: CoverageData[]): AggregateCoverage { ... }

const parseLcov = async (lcovString: string): Promise<CoverageData[]> => { ... }

interface LcovFile { ... }

async function fetchCoverageFromRepo(TOKEN: string) { ... }

export const nodeCoverage = async (localDir: string, TOKEN: string) => { ... };
```

**Modules & Imports**

* **node-fetch**: Utilized to fetch the necessary data from GitHub repositories.
    
* **lcov-parse**: A module to parse LCOV format coverage reports, which is a common format for JavaScript/Node.js coverage reports.
    
* **fs & path**: Native Node.js modules used for file handling and path manipulations.
    
* **generateBadge from common**: A utility to generate the actual SVG badge based on the coverage percentage.
    

**NODE\_REPO\_MAP**

This is a mapping of Node.js repositories (or services) with their associated URL (probably where the LCOV files are stored) and a direct link to the repository.

**Interfaces: CoverageData, PackageCoverage, and AggregateCoverage**

These TypeScript interfaces define the expected structure of coverage data, package-level coverage data, and aggregated coverage data, respectively.

**Function: computeCoverage(data)**

Given an array of `CoverageData`, this function calculates the line, function, and branch coverages. It also computes an overall average coverage percentage from the three.

**Function: parseLcov(lcovString)**

This asynchronous function takes in the LCOV formatted string, parses it using the `lcovParse` module, and returns the parsed data in the form of the `CoverageData` interface.

**Function: fetchCoverageFromRepo(TOKEN)**

This core function:

1. Iterates through each repository in the `NODE_REPO_MAP`.
    
2. Fetches the coverage data (LCOV format) from the associated GitHub URL.
    
3. Parses the fetched LCOV data to get the coverage metrics.
    
4. Calculates the overall coverage metrics for each package or service.
    
5. Returns a collection of package coverages and an overall line coverage for each repository.
    

**Main Function: nodeCoverage(localDir, TOKEN)**

This is the orchestrator for the Node.js coverage badge generation:

1. **Fetching and Calculating Coverage Data**
    
    By invoking `fetchCoverageFromRepo`, it fetches and computes coverage metrics for every specified Node.js repository.
    
2. **Generating and Saving Badges**
    
    For every repository and package inside that repository, it generates a badge using the `generateBadge` utility. The badge SVGs are then saved in the locally cloned `public-badges-repo` directory.
    
3. **Error Handling**
    
    Errors, such as failure in fetching a file or other issues, are logged to the console for troubleshooting.
    

In a nutshell, the `nodeCoverage` The module is focused on Node.js projects. It fetches LCOV formatted coverage reports from specific GitHub repositories, parses and computes coverage percentages, and then generates and saves corresponding badges to a local directory. The structured and modular approach ensures that Node.js-specific logic is isolated, making future enhancements or troubleshooting more straightforward.

### **Module Breakdown:** [**pythonCoverage**](https://github.com/sushant8421/central-repo-coverages/blob/main/src/pythonCoverage.ts)

The `pythonCoverage` module is designed to generate coverage badges for Python projects by fetching `.txt` files that contain coverage details from specified GitHub repositories, parsing the contents, and creating SVG badges based on the fetched data.

**Imports:**

* **fetch**: Used to fetch the data from GitHub repositories.
    
* **fs & path**: Native Node.js modules for file handling and path manipulations.
    
* **generateBadge**: Utility to generate the SVG badge based on the coverage percentage.
    
* **config**: To access the configuration details like the GitHub token.
    

**PYTHON\_REPO\_MAP**:

This is a map of Python repositories with their associated URLs where `.txt` coverage files are stored and a direct link to the repository.

**Interfaces**:

* **RepoMap**: Describes the structure of the mapping of repositories to their respective URLs and repository links.
    
* **CoverageData**: Details the structure of coverage data, having an overall percentage and a breakdown of percentages by module.
    

**Function: fetchCoverageDataFromRepo(repoUrl, TOKEN):**

1. Fetches the directory structure for the given repo URL, expecting a tree structure where `.txt` files denote coverage data.
    
2. For each `.txt` file, it fetches the file's content, and then processes its lines. The overall coverage is derived from the last line, while the module-specific coverages are extracted from the other lines.
    
3. Returns a mapping of filenames to their respective `CoverageData`.
    

**Main Function: pythonCoverage(localDir, TOKEN):**

1. **Iterating Over Repositories**:
    
    For each repository in `PYTHON_REPO_MAP`, fetches the coverage data using `fetchCoverageDataFromRepo`.
    
2. **Processing Coverages and Generating Badges**:
    
    * Each fetched file's coverage data is processed.
        
    * Individual badges are generated for each file (or Python module/package).
        
    * An overall badge for the repository is generated by averaging the coverages of the individual files.
        
3. **File Writing**:
    
    * Badges (SVGs) are written to a directory corresponding to the repository in the `public-badges-repo`.
        
    * A `.repourl` file containing the repo's link is also written to the same directory.
        
4. **Error Handling**:
    
    Errors are caught and logged to the console for troubleshooting.
    

To summarize, the `pythonCoverage` module:

* Targets Python repositories specified in `PYTHON_REPO_MAP`.
    
* Fetches `.txt` files from these repositories which are presumed to contain coverage data.
    
* Parses this data to generate coverage percentages.
    
* Uses these percentages to create SVG badges.
    
* Writes these badges to a local directory (`public-badges-repo`).
    

### **TL;DR**

```markdown
1. CityMall Codebase
   |
   └──> Dynamic Code Coverage Badges on GitHub

2. Preparing Repository for Coverage Data
   |
   ├─> a. Golang Repositories
   |     |
   |     ├── Initialize GitHub Action for tests
   |     ├── Activate workflow on branches
   |     └── Execute tests and push coverage data to branch
   |
   ├─> b. Node.js Repositories
   |     |
   |     ├── Implement GitHub Action for Node.js
   |     ├── Trigger workflow on branches
   |     └── Run tests and commit the coverage data
   |
   └─> c. Python Repositories
         |
         ├── Design GitHub Action for Python
         ├── Trigger workflow for the master branch
         └── Execute tests and commit the reports

3. Updating Repository's Coverage
   |
   ├─> Go:
   |     |
   |     ├── Fetch cover.out files
   |     ├── Extract the coverage percentage
   |     └── Generate and store badge SVGs
   |
   ├─> NodeJS:
   |     |
   |     ├── Fetch lcov.info files
   |     ├── Extract data using lcov-parse
   |     ├── Compute aggregate coverage percentages
   |     └── Design and save badge SVGs
   |
   └─> Python:
         |
         ├── Fetch the .txt coverage files
         ├── Extract coverage percentages
         └── Create and save the badge SVGs

4. Structured Approach for Badge Generation
   |
   └──> Central Function: coverageBadge
         |
         ├── Setting up local directory
         ├── Generating coverage badges for projects
         |     |
         |     ├── Go
         |     ├── Node.js
         |     └── Python
         |
         ├── Constructing README
         ├── Pushing changes to GitHub
         └── Cleaning up
```

### **Conclusion:**

At CityMall, badges aren't just digital decor. They symbolize our unyielding dedication to code superiority. They guarantee that every code piece meets our high standards, highlighting that at CityMall, quality isn't a mere metric—it's an oath.

---