gulp-gitflow
============

A [GulpJS](https://github.com/gulpjs) plugin that enables support for git-flow style releases.
.

This tries to follow the API proposed by the [jgit-flow](https://bitbucket.org/atlassian/jgit-flow/wiki/Home) JAVA maven
plugin by Atlassian and is inspired by the _convention over configuration_ design paradigm. 

> Currently, only `release-start` and `release-finish` features are implemented.

## Gitflow

A proposed workflow revolving around the use of git as a central tool. Defines a branching model to follow using best
practices and convenience directives.

* See the [original concept](http://nvie.com/posts/a-successful-git-branching-model/) at nvie.com.
* Read the [derivations](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) forged by the 
people at Atlassian.


## Installation

`gulp-gitflow` is a **Gulp 4.0+ plugin**. It defines a `CustomRegistry` that groups common flow-related tasks and must
be registered in your application.


```bash
git clone http://github.com/nfantone/gulp-gitflow.git
cd gulp-gitflow
npm install
```

### Requirements

* Gulp 4.0+
* npm 2.12+

To install latest Node.js/npm on Ubuntu/Debian:

```bash
# Note the new setup script name for Node.js v0.12
curl -sL https://deb.nodesource.com/setup_0.12 | sudo bash -

# Then install with:
sudo apt-get install -y nodejs
```

> GulpJS 4.0 is yet to be publicly released. For now, use the `gulpjs/gulp#4.0` branch or follow [this](https://demisx.github.io/gulp4/2015/01/15/install-gulp4.html)
guide.


## Usage

### Simple

In your `gulpfile.js` declare:

```javascript
var gulp = require('gulp');
var Gitflow = require('gulp-gitflow');

gulp.registry(new Gitflow());

```

And then, you can call in all the tasks described in the API below, such as:

```bash
gulp release-start
```

### Advanced

You may pass in an `options` configuration object to the `Gitflow` object to override some or all of the default
settings.

```javascript
var gulp = require('gulp');
var Gitflow = require('gulp-gitflow');

gulp.registry(new Gitflow({
    packages: ['*.json']
}));
```

Here, the `packages` property expects an array of _globs_ that match `json` files containing version information 
(i.e: `package.json` or `bower.json`).

## API

### `new Gitflow([options])`

Constructs a new Gulp [custom registry](https://github.com/phated/undertaker/blob/master/README.md#custom-registries), ready
to be added to the existing registry via `gulp.registry`.

`options` is an optional object that can be defined to override the following sensible defaults:

```javascript
 {
	branches: {
		developBranchName: 'develop',
		masterBranchName: 'master'
	},
	release: {
		branchPrefix: 'release/'
	},
	version: {
		tagPrefix: ''
	},
	packages: ['package.json'] // Supports glob syntax
};
```

This parameters permits you to configure branch, tag names and package files.

### `release-start`

Prepares the project for a new release. Creates a release branch and updates package files with the release version.
Version numbering follows [semver](http://semver.org/) specifications.

```bash
gulp release-start [-v --version] [-t --type]
```

* Next release version defaults to _MINOR_ increment.
* `-t` or `--type` can be used to indicate other types of increment (_MAJOR_ or _PATCH_).
* `-v` or `--version` can be used to indicate a specific next version (such as `3.2.2.4-beta`)
* If your current version ends with a suffix, next default version will be that same number without the suffix 
(`0.0.2-dev` -> `0.0.2`).
* Nothing is pushed to `origin` during this task.

> See https://bitbucket.org/atlassian/jgit-flow/wiki/goals/release-start


### `release-finish`

Releases the project. Merges the release branch, updates package files to new development version and tags the
`master` branch. Pushes newly created tag and `master` to `origin`. Deletes the release branch afterwards.

```bash
gulp release-finish
```

* At this point, if you have started a release but later decide that you no longer want to continue, 
just delete the release branch (using `git branch -D <release-branch>`).
* There can only be **one pending release** at a given time. Running this command with more than one `release/*`
branch (or none), will end up in failure.

> See https://bitbucket.org/atlassian/jgit-flow/wiki/goals/release-finish

## License

MIT
