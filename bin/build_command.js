
/**
 * Gets the current platform in a simplified manner.
 * 
 * @returns 
 */
function getPlatform () {
  return process.platform === 'win32' ? 'win' : 'nix'
}

/**
 * Finds the keyword for setting environmental varaiable in the current os.
 * 
 * @returns 
 */
const getOsEnvironmentalKeyword = () => {
  return getPlatform() === 'win' ? 'set ' : 'export '
}

/**
 * Creates a string from a javascript object
 * that will enable setting multiple environmental variables for the current os.
 * @param {any} obj 
 * @returns 
 */
const buildEnvironmentalScript = (obj, outer) => {
  let qs = ''
  let cmd = getOsEnvironmentalKeyword()
  if (!outer) return qs

  obj = obj || {}
  obj = Object.assign(outer, obj)

  for (key in obj) {
    if (typeof obj[key] === 'string') { qs += cmd + key + '=' + obj[key] + '&&' }
  }
  return qs
}

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
 * 
 * @param {any} scripts 
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

  return [findNpmRunMatches(scriptCommand).reduce((last, match) => {
    let lookUp = scripts
    let scriptToReplace = match[2]

    lookUp = lookUp && scriptToReplace in lookUp ? lookUp : npmcsScript.scripts

    if (!lookUp || !(scriptToReplace in lookUp)) {
      throw new Error(`Invalid command ${scriptToReplace} does not exist in npmcs-scripts.js, cannot do npm run ${scriptToReplace}\n`)
    }

    return last.replace(match[0], lookUp[scriptToReplace])
  }, scriptCommand)].map((commandString) => {
    let finalCmd = buildEnvironmentalScript(
      npmcsScript['env']
        ? npmcsScript['env'][customPlatform + '-' + mode] ||
        npmcsScript['env'][os + '-' + mode] ||
        npmcsScript['env'][customPlatform] ||
        npmcsScript['env'][os] : null,
      npmcsScript['env']
    ) + commandString
    process.stdout.write(`npmcs running command: ${finalCmd}\n`)
    return finalCmd
  }).find(() => true)
}
