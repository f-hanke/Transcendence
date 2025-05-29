JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0ODUyOTg3MiwiZXhwIjoxNzQ4NTMzNDcyfQ.hp99QeDBVSu0pATk8PeSQ3YH4hwdpgpNyaSglqb6puI
ACTIVE_MATCH_ID=id-1748531830348-cjgfboksd


echo PLEASE ENSURE YOU SET THE JWT IN THE SCRIPT BEFORE CALLING ENPOINTS
echo CURRENT JWT IS $JWT

echo TRYING TO START A GAME ROM GAMESERVICE VIA THE API GATEWAY
echo
curl -k -X POST https://localhost:8443/GAMESERVICE/api/game/init \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{
    "typeOfGame": "classic",
    "hostId": "host123",
    "oponentId": "opponent456",
    "matchId": "match789"
  }'

echo
echo

echo TRYING TO FETCH ALL THE ACTIVE GAMES FROM GAMESERVICE VIA THE API GATEWAY
echo
curl -k -X GET https://localhost:8443/GAMESERVICE/api/game/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \

echo
echo

echo TRYING TO UPDATE PADDLE POSITION
echo
curl -k -X POST https://localhost:8443/GAMESERVICE/api/game/paddle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d "{
    \"matchId\": \"${ACTIVE_MATCH_ID}\",
    \"player\": 1,
    \"newY\": 20
  }"

echo
echo



