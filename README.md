# <img src="https://www.dropbox.com/s/tbm0ulwypyfcppi/gulp-gitflow.png?raw=1" width="70" height="70"> gulp-release
A [GulpJS](https://github.com/gulpjs) plugin that enables support for git-flow style releases. It requires the [gitflow command line tool](https://github.com/petervanderdoes/gitflow-avh) to be installed on your system.

[![js-semistandard-style](https://cdn.rawgit.com/flet/semistandard/master/badge.svg)](https://github.com/Flet/semistandard)

## Gitflow
A proposed workflow revolving around the use of git as a central tool. Defines a branching model to follow using best practices and convenience directives.
- See the [original concept](http://nvie.com/posts/a-successful-git-branching-model/) at nvie.com.
- Read the [derivations](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) forged by the
- people at Atlassian.

## Installation
`gulp-release` is a **Gulp plugin**. It defines custom tasks that group common flow-related behaviors when releasing software.

```bash
npm i --save-dev gulp-release
```

### Requirements
- gitflow `^1.9.0`
- gulp `~3.9`
- npm `^3.0.0`

```bash
# Add node repositories
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -

# Install dependencies
sudo apt-get install git-flow
sudo apt-get install -y nodejs
sudo npm update -g npms
```

## Usage
### Simple
In your `gulpfile.js` declare:

```javascript
'use strict';
var gulp = require('gulp');
var release = require('gulp-release');

release.register(gulp);
```

This will register tasks on your `gulp` instance. After that, you'll be able to call (or depend upon) all the tasks described below, such as:

```bash
$ gulp release
```

### Advanced
You may pass in an `options` configuration object to the `register` method to override some or all of the default settings.

```javascript
'use strict';
var gulp = require('gulp');
var release = require('gulp-release');

release.register(gulp, { packages: ['package.json'] });
```

Here, the `packages` property expects an array of _globs_ that match `json` files containing version information (i.e: `package.json`, `bower.json`, `component.json`).

## API
### `register(gulpInst, options)`
Declares tasks on the `gulpInst` gulp instance. `options` is an optional object that can be defined to override the following sensible defaults:

```javascript
 {
     tasks: {
       release: 'release'
     },
     messages: {
       bump: 'Bump release version',
       next: 'Set next development version'
    },
    packages: ['package.json'] // Supports glob syntax
};
```

This parameters permits you to configure main task name, commit messages and `.json` files containing a `.version` attribute that will be bumped on a new release.

## Tasks
### `release`
Performs a full, automatic project release. Uses `git flow release` internally. Name is configurable.

> It's required that your version numbering follows [semver](http://semver.org/) specifications.

```bash
gulp release [-v --version] [-t --type] [-p --push]
```

The repository you invoke this task on, must be `git flow` enabled. Run `git flow init` if you haven't already, before running `gulp release`. Otherwise, the task will fail.

- Next release version defaults to _PATCH_ increment.
- `-t` or `--type` can be used to indicate other types of increment (_MAJOR_, _MINOR or _PATCH_).
- `-v` or `--version` can be used to indicate a specific next version (such as `3.2.2-beta`). If left blank, the version from your first configured package file (ie., `package.json`) will be used.
- If your current version ends with a suffix, next default version will be that same number without the suffix
- (`0.0.2-dev` -> `0.0.2`).
- `-p` or `--push` indicate whether to push results (branches and tags) to `origin` or not after finishing the release process. Defaults to `false`.

This recipe will perform the following actions, sequentially:

1. Invoke `git flow release start -F <version>`. Where `<version>` is either set from a command line argument or read from a package file.
2. Bump the version on all package files and [generate a codename](https://www.npmjs.com/package/gulp-codename) for the release.
3. Commit changes from last step to `develop` using `"Bump release version"` as message (configurable).
4. Invoke `git flow release finish -m <codename> <version>`.
5. Bump the version on all packages files to _next development iteration_ using a `-dev` suffix (like `1.0.1-dev`).
6. Commit changes from last step to `develop` using `"Set next development version"` as message (configurable).
7. If the `-p` (or `--push`) flag was set, push all tags and local branches to `origin`.

> See the [git flow release](https://github.com/petervanderdoes/gitflow-avh/wiki/Reference:-git-flow-release#reference----git-flow-release) wiki for details on what's happening under the hood when calling `git flow release start|finish`.

## License
MIT
