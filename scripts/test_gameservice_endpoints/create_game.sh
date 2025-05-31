#!/bin/bash

# Load JWT and match ID from env.sh
source ./env.sh

echo PLEASE ENSURE YOU SET THE JWT IN THE SCRIPT BEFORE CALLING ENPOINTS
echo CURRENT JWT IS $JWT

echo TRYING TO START A GAME ROM GAMESERVICE VIA THE API GATEWAY
echo
curl -k -X POST https://localhost:8443/GAMESERVICE/api/game/init \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{
    "typeOfGame": "localPvP",
    "hostId": "host123",
    "oponentId": "opponent456",
    "matchId": "match789"
  }'

echo
echo

