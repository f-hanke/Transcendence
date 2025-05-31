
#!/bin/bash

# Load JWT and match ID from env.sh
source ./env.sh

echo TRYING TO FETCH ALL THE ACTIVE GAMES FROM GAMESERVICE VIA THE API GATEWAY
echo
curl -k -X GET https://localhost:8443/GAMESERVICE/api/game/active \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \

echo
echo





