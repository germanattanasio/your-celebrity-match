#!/bin/bash
export VCAP_SERVICES=`cat VCAP_SERVICES.json`

nodemon app.js