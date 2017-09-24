# npmcs

npmcs is a tool for easily making cross platform scripts within your package.json. npmcs automatically detects the host operating system, and runs commands specified in package.json for the right platform.

This enables you to tweak npm scripts to run differently depending on the host platform and without worrying about a certain command being cross platform.  

With npmcs, your package.json scripts object changes to this:
```
"scripts": {
        "start": "node node_modules/npmcs/bin start",
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

 # Installation

Installation as a dev dependency (recommended):
```npm install --save-dev npmcs```

alternatively npmcs can be installed globablly:
```npm install -g npmcs```

# environment
 npmcs also allows you to define environmental variables in a cross platform way by specifying "env" within the scripts portion of your package.json file. 
 
 This will not override any environmental settings that may have been set in your commands making it perfectly safe
 to split setting environmental variables between the script commands and the env setting.

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
        "win":{
             "NODE_ENV": "development"
        },
        "nix":{
              "NODE_ENV": "development",
              "ONLY_ON_NIX":"SomethingNixSpecific"
        }
    }
}
 ``` 

 npmcs will look for properties defined in [platform] first before defaulting to env to find environmental variables. 


 npcms also lets you define environmental variables based on if you're running in development or production mode.
 To achieve this, you append -production or -development to the entries within the env.

```
"scripts": {
    "env": {
        "win-production":{
            "NODE_ENV": "production"
        },
        "win-development":{
            "NODE_ENV": "development"
        },
        "nix-production":{
            "NODE_ENV": "development",
            "ONLY_ON_NIX":"SomethingNixSpecific"
        },
        "nix-development":{
            "NODE_ENV": "development",
            "ONLY_ON_NIX":"SomethingNixSpecific"
        }
    }
}
 ``` 

 For development/production to work you must provide npcms an argument specifying if youre running development or production, thus the command becomes:

 ```node node_modules/npmcs/bin start development [start] development```

 or similarily:

 ```node node_modules/npmcs/bin start development [start] production```
