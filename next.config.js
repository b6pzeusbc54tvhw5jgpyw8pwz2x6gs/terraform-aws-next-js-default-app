const dateTime = new Date().toISOString().slice(0,19).replace(/:/g,'')
// You can replace default with the latest git commit hash or tag here
const revisionOrTag = process.env.GIT_REVISION || `default`
const buildId = `${revisionOrTag}-${dateTime}`.replace(/[_: ]/g, '-')

module.exports = {
  generateBuildId: () => buildId,
  assetPrefix: `/static/${buildId}`,
}
