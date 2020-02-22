#!/usr/bin/env sh

# abort on errors
set -e

# navigate into the build output directory
cd _build

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:kshalm/spdcalc.git master:gh-pages

cd -
