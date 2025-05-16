#!/bin/bash

npm run build --prefix ./shared

set -e

TAG="#devprocess"

trap "echo 'Caught SIGINT, killing all...'; kill 0; exit" SIGINT SIGTERM

function run_in_terminal {
  gnome-terminal --title=$2 -- bash -c "$1 && TRANSCENDENCE_DEV=$1 exec bash"
}

run_in_terminal "cd apiGateway && npm run start" "apiGateway" &
run_in_terminal "cd webserver && npm run start" "webserver" &
run_in_terminal "cd usersAndAuth && npm run start" "usersAndAuth" &
run_in_terminal "cd remote && npm run start" "remote" &
run_in_terminal "cd backend && npm run start" "backend" &
run_in_terminal "cd chat-service && npm run start" "chat-service" &

read -p "Press any key to kill transcendence..."

bash kill_all.sh

# trap "echo 'Caught SIGINT, killing all...'; kill 0; exit" SIGINT SIGTERM

# (cd usersAndAuth && npm run dev) & 
# PID_usersAndAuth=$!

# (cd remote && npm run dev) & 
# PID_remote=$!

# (cd apiGateway && npm run dev) & 
# PID_apiGateway=$!


# (cd webserver && npm run dev) & 
# PID_webserver=$!

# (cd backend && npm run dev) & 
# PID_backend=$!

# (cd chat-service && npm run dev) & 
# PID_chat=$!

# echo PID_usersAndAuth=$PID_usersAndAuth
# echo PID_remote=$PID_remote
# echo PID_apiGateway=$PID_apiGateway
# echo PID_backend=$PID_backend
# echo PID_chat=$PID_chat
# echo PID_webserver=$PID_webserver

# trap "kill $PID_usersAndAuth $PID_remote $PID_apiGateway $PID_backend $PID_chat $PID_webserver; exit" SIGINT

# # Wait for any process to exit
# wait -n

# echo "One of the services exited. Stopping all..."
# kill $PID_usersAndAuth $PID_remote $PID_apiGateway $PID_backend $PID_chat $PID_webserver
# kill 0
# wait
