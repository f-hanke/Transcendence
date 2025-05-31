#!/bin/bash

# Load JWT and match ID from env.sh
source ./env.sh

# Ensure a paddle position argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <newY-position>"
  exit 1
fi

NEW_Y=$1

echo PLEASE ENSURE YOU SET THE JWT IN THE SCRIPT BEFORE CALLING ENPOINTS
echo CURRENT JWT IS $JWT

echo TRYING TO UPDATE PADDLE POSITION
echo
curl -k -X POST https://localhost:8443/GAMESERVICE/api/game/paddle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d @- <<EOF
{
  "matchId": "${ACTIVE_MATCH_ID}",
  "player": 1,
  "newY": ${NEW_Y}
}
EOF

echo
echo





