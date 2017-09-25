# npmcs

npmcs is a tool for easily defining scripts that run depending on the host operating systems platform,
enabling you to run scripts without worrying about ensuring a script will run on both windows and linux. 
Furthermore, because scripts are defined in a .js file rather than .json, scripts can be commented
making it easier to work with.

With npmcs, you define an npmcs-scripts.js file in the root directory of your application:
```javascript
//npmcs-scripts.js
module.exports = {
	scripts: {
		/*
            Windows scripts, run on a windows environment
        */
		win: {
			start: 'start npm run dev',
			dev: 'SET NODE_ENV=development && npm run build && npm run nodemon',
			prod: 'SET NODE_ENV=production node src/app.js',
			nodemon: 'nodemon --debug src/app.js',
			build: 'start webpack -d --watch',
			test: 'echo "Error: no test specified" && exit 1'
		},
		/*
            Unix scripts, run on a unix environment
        */
		nix: {
			start: 'npm run dev',
			dev: 'export NODE_ENV=development && npm run build && npm run nodemon',
			prod: 'export NODE_ENV=production node src/app.js',
			nodemon: 'nodemon --debug src/app.js',
			build: 'webpack -d --watch',
			test: 'echo "Error: no test specified" && exit 1'
		}
	}
}
 ``` 

 If installing npmcs via dev dependencies, the scripts portion of package.json will end up looking
 like this:

 ```javascript
"scripts": {
    //Tell npmcs to run the "start" script specified in npmcs-scripts.js
    "start": "node node_modules/npmcs/bin start"
}
```

# Installation

Installation as a dev dependency (recommended):

`npm install --save-dev npmcs`

alternatively npmcs can be installed globablly:

`npm install -g npmcs`

# Installation quickstart

Create a new file name npmcs-scripts.js in the root of your directory and paste the following:

```javascript
module.exports = {
	scripts: {
		win: {
			start: 'node src/app.js',
		},
		nix: {
			start: 'node src/app.js',
		}
	},
	env: {
		win: {
			NODE_ENV: 'development'
		},
		nix: {
			NODE_ENV: 'development'
		}
	}
};
```

Your package.json file should then look like the following:

```javascript
"scripts": {
    "start": "node node_modules/npmcs/bin start"
}
```


# environment
 npmcs also allows you to define environmental variables in a cross platform way by specifying "env" within the scripts portion of your package.json file. 
 
 This will not override any environmental settings that may have been set in your commands making it perfectly safe
 to split setting environmental variables between the script commands and the env setting.

 The following script sets the NODE_ENV environment variable no matter if you're running on windows or linux/unix.
 ```javascript
module.exports = {
    env: {
         NODE_ENV: "development"
    }
}
 ``` 

 This can be further refined by setting environmental variables based on the running platform:

```javascript
module.exports = {
    env: {
		/* Windows environmental variables */
		win: {
			NODE_ENV: 'development'
		},
		/* Unix environmental variables */
		nix: {
			NODE_ENV: 'development'
		}
	}
}
 ``` 

 npmcs will look for properties defined in [platform] first before defaulting to env to find environmental variables. 


 npcms also lets you define environmental variables based on if you're running in development or production mode.
 To achieve this, you append -production or -development to the entries within the env.

```javascript
module.exports =  {
    env: {
        'win-production':{
            NODE_ENV: "production"
        },
        'win-development':{
            NODE_ENV: "development"
        },
        'nix-production':{
            NODE_ENV: "development",
            ONLY_ON_NIX:"SomethingNixSpecific"
        },
        'nix-development':{
            NODE_ENV: "development",
            ONLY_ON_NIX:"SomethingNixSpecific"
        }
    }
}
 ``` 

 For development/production to work you must provide npcms an argument specifying if youre running development or production, thus the command becomes:

 ```node node_modules/npmcs/bin [start] development```

 or similarily:

 ```node node_modules/npmcs/bin [start] production```

 and a corresponding package.json may look like this:

 ```javascript
"scripts": {
    //Tell npmcs to run the "start" script for the current platform and set environmental variables from 
    //[platform]-development
    "start": "node node_modules/npmcs/bin start development"
}
```


# Change log

[x] v1.0.3 updated to work with npmcs-scripts.js file rather than package.json.
[x] v1.0.5 minor changes and updates to readme.
[x] v1.0.7 quick fixes.