#!/bin/bash

if [ -f .env ]; then
  source .env
fi

docker compose run terraform

