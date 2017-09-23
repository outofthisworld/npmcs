# npmcs

npmcs is a tool for easily making cross platform scripts within your package.json. npmcs automatically detects the host operating system, and runs commands specified in package.json for the right platform.

This enables you to tweak npm scripts to run differently depending on the host platform and without worrying about a certain command being cross platform.  

With npmcs, your package.json scripts object changes to this:
```
"scripts": {
        "start": "npmcs start",
        "win": {
            "start": "start npm run dev",
            "dev": "SET NODE_ENV=development && npm run build && npm run nodemon",
            "prod": "SET NODE_ENV=production node src/app.js --production",
            "nodemon": "nodemon --debug src/app.js",
            "build": "start webpack -d --watch",
            "test": "echo \"Error: no test specified\" && exit 1"
        },
        "nix": {
            "start": "start npm run dev",
            "dev": "export NODE_ENV=development && npm run build && npm run nodemon",
            "prod": "export NODE_ENV=production node src/app.js --production",
            "nodemon": "nodemon --debug src/app.js",
            "build": "start webpack -d --watch",
            "test": "echo \"Error: no test specified\" && exit 1"
        }
    }
 ``` 
# environment
 npmcs also allows you to define environmental variables in a cross platform way by specifying "env" within the scripts portion of your package.json file.

 The following script sets the NODE_ENV environment variable no matter if you're running on windows or linux/unix.

 ```
"scripts": {
    "env": {
         "NODE_ENV": "development"
    }
}
 ``` 

 This can be further refined by setting environmental variables based on the running platform:

  ```
"scripts": {
    "env": {
        "win-env":{
             "NODE_ENV": "development"
        },
        "nix-env":{
              "NODE_ENV": "development",
              "ONLY_ON_NIX":"SomethingNixSpecific"
        }
    }
}
 ``` 

 npmcs will look for properties defined in [platform]-env first before defaulting to env to find environmental variables. 

# Installation
    `npm install -g npmcs`
