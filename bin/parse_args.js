/**
 * Pases command line arguments.
 * 
 * @returns 
 */
module.exports = function(args) {

    if (!Array.isArray(args)) {
        throw new Error('supplied args must be an array');
    }

    let commandToRun = args[2];

    if (!commandToRun) {
        throw new Error("npmcs: entry command (e.g start) must be supplied as an argument");
    }

    let customPlatform = args[3];

    let mode =
        customPlatform === "production" ?
        "production" :
        customPlatform === "development" ? "development" : args[4];

    customPlatform =
        customPlatform === "production" || customPlatform === "development" ?
        null :
        customPlatform;

    return {
        /* The command to run*/
        commandToRun,
        /* Set if the user has specified there own platform */
        customPlatform,
        /* production or development mode */
        mode
    };
}