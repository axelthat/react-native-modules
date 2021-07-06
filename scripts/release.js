const { readFileSync, writeFileSync } = require("fs")
const path = require("path")
const chalk = require("chalk")
const { execSync } = require("child_process")

const DIR = path.join(__dirname, "/..")
const PACKAGES = { modal: true, ["sqlite-orm"]: true }

const cliArgs = process.argv.slice(2)

const args = {
  version: cliArgs[1],
  package: cliArgs[3]
}

for (const [k, v] of Object.entries(args)) {
  if (!v) {
    console.log(chalk.red(`No ${k} specified`))
    process.exit(1)
  }
}

const { version, package } = args
if (!PACKAGES[package]) {
  console.log(chalk.red(`"${package}" package doesn't exist`))
  process.exit(1)
}

const packageDir = path.join(DIR, `packages/${package}`)
const packageJsonPath = path.join(packageDir, "package.json")
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))

packageJson.version = version

writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4))

execSync(
  `
        cd ${packageDir} &&
        yarn changelog &&
        cd ${DIR} &&
        yarn commit -m "chore(release): ${package}@${version}" &&
        git tag -a '${package}@${version}' -m "" &&
        git push --tags
    `
)

console.log(chalk.green(`🥳 Successfully released ${package}@${version}`))
