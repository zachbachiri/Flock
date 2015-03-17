# Twitter Analysis Tool
=====================
Tool for advanced twitter search

## Angular
- skeleton angular project with app.js, and index.html with ng-app and ng-controller set up

## Git workflow
1. Clone repo onto computer (git clone https://github.com/zachbachiri/Twitter-Analysis-Tool.git)
2. general workflow will be pull master -> create new branch -> work -> push branch to repo -> make pull request -> merge to master after code review
3. Each time you work, be sure to pull from master before making a new branch (git pull origin master). Never do work on master.
4. Then make branch locally (git checkout -b branch_name)
5. After doing work locally, add files. There are multiple ways to do this('git add file-or-directory_name', git add -A <- this is dangerous sometimes)
6. commit change (git commit -m "commit message - description of what you did")
7. push changes to branch ('git push origin branch_name')
8. Create pull request in github. Go to the branch and hit 'Compare, review, create a pull request', make request to merge branch into master
9. After review, merge the branch into master in github. Then merge master to the gh-page branch so that branch is up to date.

###More useful github commands
####Rebase. Use case is if you are doing work locally and someone merges to master. This will rebase your work on top of the new work
1. 'git checkout master' to get on master
2. 'git pull origin master' to update master
3. 'git checkout branch_name' to get back on your branch
4. 'git rebase master' will rebase. Will not work if there are merge conflicts

#### Status
- 'git status' shows all modified files(helps when you are doing a git add)

#### Update gh-pages
1. 'git checkout master'
2. 'git pull origin master' 
3. 'git checkout gh-pages'
4. 'git pull origin gh-pages'
5. 'git rebase master'
6. 'git push origin gh-pages'

## Building sass
1. install Sass(follow mac command line installation instructions)
2. before doing work, run 'sass --watch sass file:css output file' eg('sass --watch styles/main.scss:styles/main.css')
3. this will automatically write changes from the sass file to the css output file whenever you save the sass file

## Grunt
- Grunt files are included in node_modules, for use if we want. Package.json and gruntfile.js are both related to grunt, so if we don't use it these are not necessary

## Unit Testing
- Unit tests live in the /test/unit directory. They use Jasmine, and more information can be found in the documentation: http://jasmine.github.io/2.2/introduction.html
- For the moment, we can have a separate unit testing file for each controller. Within each unit testing file, we can group tests by 'suites' (using the 'describe' function) and group them even further by 'specs' (using the 'it' function). The individual tests are similar to other unit tests where you will create example data and use expect([expected value]).toBe([actual value]) to make sure the code is doing what it should be doing
- To run the tests, go to the root directory of the project and type 'npm install'. This should install all the dependencies needed for testing. Then you can type 'npm test'. This will start a server, open a window in Chrome, and the terminal should display how many tests passed. If you keep the server running and add more unit tests later, then all the tests will be re-run.
- The /test/karma.conf.js file is a configuration file for running the tests. NOTE: If you are testing code that uses new dependencies or code that is in a new file, then add the files/dependencies to the 'files' array in the karma.conf.js file

## Running Locally
- Make sure you have python installed on your computer.
- In your terminal, change directories to the flock repo and type 'python -m SimpleHTTPServer 8000' if your terminal uses python2 or type 'python -m http.server 8000' if your terminal uses python3.
- Go to http://localhost:8000 and the flock app should load. You can actually replace 8000 to whichever port number you want to use.

