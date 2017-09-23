# npmcs

npmcs automatically detects the host operating system, and runs commands specified in package.json for the right platform.

This enables you to tweak npm scripts to run differently depending on the host platform and without worrying about a certain command being cross platform.  

With npmcs, your package.json scripts changes to this:
```
"scripts": {
        "start": "npmcs start",
        "win": {
            "start": "start npm run dev",
            "dev": "SET NODE_ENV=development && npm run build && npm run nodemon",
            "prod": "node src/app.js --production",
            "nodemon": "nodemon --debug src/app.js",
            "build": "start webpack -d --watch",
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "nix": {
            "start": "start npm run dev",
            "dev": "npm run build && npm run nodemon",
            "prod": "node src/app.js --production",
            "nodemon": "nodemon --debug src/app.js",
            "build": "start webpack -d --watch",
            "test": "echo \"Error: no test specified\" && exit 1"
        }
    }
 ``` 

# Installation
    `npm install -g npmcs`
