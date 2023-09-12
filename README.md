# central-repo-coverages

## To Run the Script

1. Clone the repository
2. Install the dependencies
3. Add env variables
4. Build the project
5. Run the project

```bash
git clone
cd central-repo-coverages
npm ci
npm run build
npm start
```

```markdown
1. CityMall Codebase
   |
   └──> Dynamic Code Coverage Badges on GitHub

2. Preparing Repository for Coverage Data
   |
   ├─> a. Golang Repositories
   | |
   | ├── Initialize GitHub Action for tests
   | ├── Activate workflow on branches
   | └── Execute tests and push coverage data to branch
   |
   ├─> b. Node.js Repositories
   | |
   | ├── Implement GitHub Action for Node.js
   | ├── Trigger workflow on branches
   | └── Run tests and commit the coverage data
   |
   └─> c. Python Repositories
   |
   ├── Design GitHub Action for Python
   ├── Trigger workflow for the master branch
   └── Execute tests and commit the reports

3. Updating Repository's Coverage
   |
   ├─> Go:
   | |
   | ├── Fetch cover.out files
   | ├── Extract the coverage percentage
   | └── Generate and store badge SVGs
   |
   ├─> NodeJS:
   | |
   | ├── Fetch lcov.info files
   | ├── Extract data using lcov-parse
   | ├── Compute aggregate coverage percentages
   | └── Design and save badge SVGs
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
   | |
   | ├── Go
   | ├── Node.js
   | └── Python
   |
   ├── Constructing README
   ├── Pushing changes to GitHub
   └── Cleaning up
```

## Follow the following blog for more details

https://sushant8421.hashnode.dev/citymalls-unified-code-coverage-crafting-dynamic-badges-for-multi-language-repositories
