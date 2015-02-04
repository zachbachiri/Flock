# Twitter Analysis Tool
=====================
Tool for advanced twitter search

## Angular
- skeleton angular project with app.js, and index.html with ng-app and ng-controller set up

## Git workflow
1. Clone repo onto computer (git clone https://github.com/zachbachiri/Twitter-Analysis-Tool.git)
2. general workflow will be pull master -> create new branch -> work -> push branch to repo -> make pull request -> merge to master after code review
3. Each time you work, be sure to pull from master before making a new branch (git pull origin master). Never do work on master.
4. Then make branch locally (git checkout -b <branch_name>)
5. After doing work locally, push the branch to the github repo (git push origin <branch_name>)
6. Create pull request in github. Go to the branch and hit 'Compare, review, create a pull request', make request to merge branch into master
7. After review, merge the branch into master in github. Then merge master to the gh-page branch so that branch is up to date.

###More useful github commands
####Rebase. Use case is if you are doing work locally and someone merges to master. This will rebase your work on top of the new work
1. 'git checkout master' to get on master
2. 'git pull origin master' to update master
3. 'git checkout <branch_name>' to get back on your branch
4. 'git rebase master' will rebase. Will not work if there are merge conflicts



## Building sass
1. install Sass(follow mac command line installation instructions)
2. before doing work, run 'sass --watch <sass file>:<css output file>' eg('sass --watch styles/main.scss:styles/main.css')

## Grunt
- Grunt files are included in node_modules, for use if we want. Package.json and gruntfile.js are both related to grunt, so if we don't use it these are not necessary




