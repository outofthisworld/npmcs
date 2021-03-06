
/**
 * Gets the current platform in a simplified manner.
 */
function getPlatform () {
  return /^win/.test(process.platform) ? 'win' : /^darwin/.test(process.platform) ? 'osx' : 'nix'
}

/*
  Attempts to detect if powershell is being used.
  This is the best method I could find to check, as there is no definitive
  difference between launching a process in cmd prompt and powershell.
*/
function isUsingPowerShell () {
  return process.env.PATHEXT && process.env.PATHEXT.toLowerCase().includes('.cpl')
}

/**
 * Finds the keyword for setting environmental varaiable in the current os.
 */
const getOsEnvironmentalKeyword = () => {
  return getPlatform() === 'win' ? !isUsingPowerShell() ? 'set ' : '$env:' : 'export '
}

/**
 * Creates a string from a javascript object
 * that will enable setting multiple environmental variables for the current os.
 */
const buildEnvironmentalScript = (obj, outer) => {
  let qs = ''
  let cmd = getOsEnvironmentalKeyword()
  if (!outer) return qs

  obj = obj || {}
  obj = Object.assign(outer, obj)

  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      qs += `${cmd}${key}=${obj[key].toString().indexOf(' ') !== -1
        ? '"' + obj[key].toString() + '"' : obj[key]}&&`
    }
  }
  return qs
}

/*
  Finds matches for npm run (task) and stores them in an array.
*/
const findNpmRunMatches = (command) => {
  let matches = []
  let match
  let find = /(npm\s+run\s+)([a-zA-Z1-9]*)/g
  while ((match = find.exec(command)) != null) {
    matches[matches.length] = match
  }
  return matches
}

/**
 * Builds the command to be run by exec.
 */
module.exports = function (options) {
  if (!options) {
    throw new Error('Error no options provided')
  }

  let npmcsScript = options.npmcsScript
  let mode = options.mode
  let customPlatform = options.customPlatform
  let commandToRun = options.commandToRun
  let err

  if (!npmcsScript) {
    err = 'npmcs: npmcs-scripts.js file was not specified.'
  }

  npmcsScript.scripts = npmcsScript.scripts || {}

  if (!commandToRun) {
    err = 'npmcs: no command to run specified'
  }

  if (err) {
    throw new Error(err)
  }

  const os = getPlatform()
  const scripts = npmcsScript.scripts[customPlatform || os] || npmcsScript.scripts

  let scriptCommand = scripts[commandToRun]

  if (!scriptCommand || !typeof scriptCommand === 'string') {
    throw new Error(`Could not locate ${commandToRun} in npmcs-scripts.js`)
  }

  return [(function buildCommandLiteral (command) {
    return findNpmRunMatches(command).reduce((last, match) => {
      let lookUp = scripts
      let scriptToReplace = match[2]

      lookUp = lookUp && scriptToReplace in lookUp ? lookUp : npmcsScript.scripts

      if (!lookUp || !(scriptToReplace in lookUp)) {
        throw new Error(`Invalid command ${scriptToReplace} does not exist in npmcs-scripts.js, cannot do npm run ${scriptToReplace}\n`)
      }

      return last.replace(match[0], buildCommandLiteral(lookUp[scriptToReplace]))
    }, command)
  })(scriptCommand)].map((commandString) => {
    let obj = npmcsScript['env']
      ? npmcsScript['env'][customPlatform + '-' + mode] ||
      npmcsScript['env'][os + '-' + mode] ||
      npmcsScript['env'][customPlatform] ||
      npmcsScript['env'][os] : null

    obj = obj === undefined && os === 'osx' ? npmcsScript['env']['nix'] : null

    return buildEnvironmentalScript(obj, npmcsScript['env']) + commandString
  }).find(() => true)
}
