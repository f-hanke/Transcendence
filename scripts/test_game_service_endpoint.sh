JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0ODUyNTUxNiwiZXhwIjoxNzQ4NTI5MTE2fQ.ldmcTEJ0tj7AGJaZGTb7X_3oTIMl89whJNGtPOGn0c8


echo PLEASE ENSURE YOU SET THE JWT IN THE SCRIPT BEFORE CALLING ENPOINTS
echo CURRENT JWT IS $JWT

echo TRYING TO START A GAME ROM GAMESERVICE VIA THE API GATEWAY
echo
curl -k -X POST https://localhost:8443/GAMESERVICE/api/game/start \
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

