#/bin/zsh

source $(dirname $0)/helpers.sh

while getopts m: flag
do
    case "$flag" in
        m) message=$OPTARG;;
    esac
done

if ! [[ -n $message ]]; then
    echo "${RED}No commit message supplied${NC}"
    exit 1;
fi

if ! [[ $message =~ ^(feat|fix|refactor|perf|chore|docs|test)(\(.*\))?: ]]; then
    echo "${RED}Invalid commit message supplied${NC}"
    exit 1;
fi


cd $DIRNAME && cd ..

step "Pushing commit..."

git add .
git commit -m "$message"
git push

step "Commit pushed successfully"

exit 0;