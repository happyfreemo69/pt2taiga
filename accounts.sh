#!/bin/bash

curl -X GET -H "X-TrackerToken: $PIVOTOKEN" "https://www.pivotaltracker.com/services/v5/projects/1452050/memberships" > accounts.json
