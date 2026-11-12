#!/bin/sh
# Called by Jenkins inside its agent. Reports are copied through the Docker
# API into the agent workspace; host bind mounts would resolve on Docker Desktop.
set -eu

test_project=${1:?Pass a Playwright project name}
case "$test_project" in
    be.integration|fe.integration|e2e) ;;
    *) echo "Unsupported test project: $test_project" >&2; exit 2 ;;
esac
: "${COMPOSE_PROJECT_NAME:?Set a unique Compose project name for this build}"
export COMPOSE_FILE=compose.ci.yaml

container_name="${COMPOSE_PROJECT_NAME}-test-$(printf '%s' "$test_project" | tr '.' '-')"
report_dir="ci-artifacts/$test_project"
mkdir -p "$report_dir"

finish() {
    test_status=$?
    trap - EXIT INT TERM
    if docker container inspect "$container_name" >/dev/null 2>&1; then
        docker logs "$container_name" > "$report_dir/console.log" 2>&1 || true
        # Preserve output for both successful and failed tests before removal.
        copy_status=0
        docker cp "$container_name:/app/playwright-report" "$report_dir/" || copy_status=1
        docker cp "$container_name:/app/test-results" "$report_dir/" || copy_status=1
        docker rm -f "$container_name" >/dev/null || true
        if [ "$test_status" -eq 0 ] && [ "$copy_status" -ne 0 ]; then
            test_status=1
        fi
    fi
    exit "$test_status"
}
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# Deliberately omit --rm: reports must be copied after the process exits.
docker compose run --no-deps -T --name "$container_name" \
    -e PLAYWRIGHT_JUNIT_OUTPUT_FILE=/app/test-results/junit.xml \
    tests npx playwright test --project="$test_project" --reporter=line,html,junit
