#!/usr/bin/env bash

curl -H "Origin: http://127.0.0.1:4567" \
 -H "Access-Control-Request-Method: POST" \
 -H "Access-Control-Request-Headers: X-Requested-With" \
 -X OPTIONS --verbose $1