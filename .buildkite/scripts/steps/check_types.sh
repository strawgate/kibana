#!/usr/bin/env bash

set -euo pipefail

source .buildkite/scripts/common/util.sh

.buildkite/scripts/bootstrap.sh

echo --- Check Types
checks-reporter-with-killswitch "Check Types" \
  node scripts/type_check
