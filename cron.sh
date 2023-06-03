#!/bin/sh

set -e

cd "$(dirname "$0")"

[ -f ./nvm.config.sh ] && . ./nvm.config.sh

[ -z "$NVM_DIR" ] || export NVM_DIR
[ -d "$NVM_DIR" ] && . "$NVM_DIR/nvm.sh"

exec node dist/cron-receive.js
