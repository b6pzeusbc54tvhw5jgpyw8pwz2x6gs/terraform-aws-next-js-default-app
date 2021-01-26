import * as fs from 'fs'
import * as path from 'path'
import packageJson from '../package.json'

const cwd = process.cwd()
const identifier = process.env.LAMBDA_IDENTIFIER || packageJson.name

const getBuildId = (buildDir: string) => {
  const {buildId} = require(path.join(buildDir,'config.json'))
  if (!buildId) throw new Error('No bulidId')
  console.log('buildId: ' + buildId)

  return buildId
}

const getRouteName = (buildId: string, type: 'API' | 'PAGE') => {
  return type === 'API'
    ? `${identifier}-api-${buildId}`
    : `${identifier}-page-${buildId}`
}

const replaceConfigJson = (buildId: string, buildDir: string) => {
  const source = path.join(buildDir, 'config.json')
  const target = path.join(buildDir, 'config.backup.json')
  fs.copyFileSync(source, target)
  const configJsonStr = fs.readFileSync(source, 'utf-8')

  const modified = configJsonStr
    .replace(/__NEXT_API_LAMBDA_0/g, getRouteName(buildId, 'API'))
    .replace(/__NEXT_PAGE_LAMBDA_0/g,getRouteName(buildId, 'PAGE'))

  fs.writeFileSync(source, modified)
}

const renameLambdaZipFiles = (buildId: string, buildDir: string) => {
  try {
    fs.renameSync(
      path.join(buildDir,'lambdas/__NEXT_API_LAMBDA_0.zip'),
      path.join(buildDir,`lambdas/${getRouteName(buildId,'API')}.zip`)
    )
    fs.renameSync(
      path.join(buildDir,'lambdas/__NEXT_PAGE_LAMBDA_0.zip'),
      path.join(buildDir,`lambdas/${getRouteName(buildId,'PAGE')}.zip`)
    )
  } catch(err) {
    if (err.code === 'ENOENT') {
      console.log(`Can not found '__NEXT_*_LAMBDA_0.zip' files. First run 'yarn tfbuild'`)
      throw err
    }
  }
}

const run = () => {
  const buildDir = path.join(cwd, '.next-tf')
  const buildId = getBuildId(buildDir)
  replaceConfigJson(buildId, buildDir)
  renameLambdaZipFiles(buildId, buildDir)
}

if (require.main === module) {
  run()
}
