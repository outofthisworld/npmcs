/**
 * Pases command line arguments.
 * 
 * @returns 
 */
module.exports = function() {
    let commandToRun = process.argv[2];

    if (!commandToRun) {
        throw new Error("npmcs: entry script must be supplied as an argument");
    }

    let customPlatform = process.argv[3];

    let mode =
        customPlatform === "production" ?
        "production" :
        customPlatform === "development" ? "development" : process.argv[4];

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