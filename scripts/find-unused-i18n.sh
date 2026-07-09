#!/bin/bash

# find-unused-i18n.sh
# Usage: ./find-unused-i18n.sh <json-file> <codebase-path>

JSON_FILE="${1:-.}"
CODEBASE_PATH="${2:-.}"

# Blacklist: paths to never report as unused (one per line)
# These are currently dynamically accessed, hence won't match
BLACKLIST=(
  "common.init"
  "common.error"
  "common.done"
  "availability.offline"
  "availability.online"
  "availability.disabled"
  "network.children"
  "network.parent"
  "network.previous_children"
  "network.siblings"
  "zigbee.external"
  "zigbee.generated"
  "zigbee.native"
  "zigbee.battery"
  "zigbee.dc_source"
  "zigbee.emergency_mains_and_transfer_switch"
  "zigbee.emergency_mains_constantly_powered"
  "zigbee.mains_3_phase"
  "zigbee.mains_single_phase"
  "zigbee.unknown"
  "zigbee.Coordinator"
  "zigbee.Router"
  "zigbee.EndDevice"
  "zigbee.Unknown"
  "zigbee.GreenPower"
  "zigbee.available"
  "zigbee.custom_clusters"
  "zigbee.input_clusters"
  "zigbee.output_clusters"
  "zigbee.other_zcl_clusters"
  "zigbee.possible"
  "ota.updating"
  "ota.idle"
  "ota.available"
  "ota.scheduled"
)

# Blacklist: parent paths to never report as unused (one per line)
PARENT_BLACKLIST=(
  "settingsSchemaDescriptions"
)

if [[ ! -f "$JSON_FILE" ]]; then
  echo "Error: JSON file '$JSON_FILE' not found"
  exit 1
fi

if [[ ! -d "$CODEBASE_PATH" ]]; then
  echo "Error: Codebase path '$CODEBASE_PATH' not found"
  exit 1
fi

# Build regex pattern from blacklist
BLACKLIST_PATTERN=$(IFS='|'; echo "${BLACKLIST[*]}" | sed 's/[[\.*^$/]/\\&/g')

# Extract full paths and leaf keys
jq -r 'paths(scalars) as $p | "\($p | join("."))|\($p[-1])"' "$JSON_FILE" | while IFS='|' read -r full_path leaf_key; do
  # Check if full_path is blacklisted
  if [[ -n "$BLACKLIST_PATTERN" ]] && [[ "$full_path" =~ ^($BLACKLIST_PATTERN)$ ]]; then
    continue
  fi

  # Check if full_path starts with any blacklisted parent
  skip=false
  for bl in "${PARENT_BLACKLIST[@]}"; do
    # Escape dots in blacklist entry for regex, then match start of path
    bl_escaped="${bl//./\.}"
    if [[ "$full_path" =~ ^${bl_escaped}(\.|$) ]]; then
      skip=true
      break
    fi
  done
  
  if $skip; then
    continue
  fi
  
  # Search for the leaf key in the codebase
  if ! rg -q "\\\$[.\[]?${leaf_key}" "$CODEBASE_PATH"; then
    echo "UNUSED: $full_path"
  fi
done