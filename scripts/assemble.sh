#!/bin/sh
cp -Lr packages/backend/node_modules packages/backend/dist/node_modules
sudo docker-compose build