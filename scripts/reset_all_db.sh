#!/bin/bash

rm -rf chat-service/db/chat_service_db.db
rm -rf remote/db_file/matchmaking_service.db
rm -rf usersAndAuth/db/user_service.db

cd chat-service && npm run db
cd ../remote && npm run db
cd ../usersAndAuth && npm run db
