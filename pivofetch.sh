#!/bin/bash
function fetch(){
    number=$1
    echo "go for "$number" --> "$i
    curl -X GET -H "X-TrackerToken: $PIVOTOKEN" "https://www.pivotaltracker.com/services/v5/projects/1452050/stories?fields=comments,labels,tasks,created_at,updated_at,name,description,requested_by_id,story_type,current_state&offset="$number"&limit=100" > $i.json
    node -e 'console.log(require("./'$i'.json").length)' | grep -q 100
    [ $? -ne 0 ] && echo 'all fetched' && exit 0;
}
i=0
while true;do
    [ $i -gt 30 ] && echo "too many fetch " && exit 1
    number=$((i*100))
    fetch $number
    i=$((i+1))
done