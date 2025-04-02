current_branch=$(git branch --show-current)
git fetch --all
sleep 1
for branch in $(git branch -r | grep -v '\->'); do  
    git branch --track "${branch#origin/}" "$branch"
done
sleep 1
git pull --all

git branch --format '%(refname:short)' | while read branch; do
    git checkout $branch
    git pull
done
# git fetch --prune
git checkout "$current_branch"