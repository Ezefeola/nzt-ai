#!/usr/bin/env bash
# Since D93 a pack is not installed: its rules come with the plugin, in nzt-software or
# nzt-games, and tech.md listing it is what makes it apply. Kept so the fixtures that name
# their packs still read as the project they seed.
# Usage: packs.sh <workspace> <pack>...
set -euo pipefail
