#call npm run build

cd dist

call git init
call git add -A
call git commit -m 'deploy'

call git push -f https://github.com/zigzaggin/ticker.git master:gh-pages

cd ..