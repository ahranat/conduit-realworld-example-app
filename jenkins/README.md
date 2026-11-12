# Jenkins pipeline

The Multibranch Pipeline checks out the branch or PR revision configured in
Jenkins using `checkout scm`. Push `Jenkinsfile` and all referenced configuration,
Dockerfiles, scripts, and tests together.

The agent must have label `docker`, Git, Docker CLI, Buildx, Compose, and access
to a Docker engine. The agent Dockerfile is in `agent/Dockerfile`.

## Build flow

1. Generate a unique Compose project name from Jenkins's `BUILD_TAG`.
2. Build frontend, backend, and test images from the checkout.
3. Start database, backend, and frontend and wait for their health checks.
4. Run backend integration tests in a test container.
5. Run E2E only after backend integration succeeds. The `BASE_URL` build
   parameter defaults to the frontend container; it can target a deployed env.
6. Archive reports, JUnit XML, traces, test console logs, and service logs under
   `ci-artifacts/`, including on test failure. Remove this build's containers,
   database volume, network, and generated image tags afterward.

Images are not pushed to a registry. Shared base images and Docker build cache
remain available. Local `compose.yaml` and its database volume are not used.

The frontend service has no backend dependency. FE integration tests must mock
their API calls. The pipeline currently starts the full app before integration
tests; it does not provision a separate app environment for each test project.

Frontend integration is currently excluded from the pipeline because
`tests/fe.integration/` has no test specifications. It can be added as a parallel
integration stage when tests are available.

## Reports with a containerized agent

The agent sends Docker commands to Docker Desktop through its socket. Docker
bind mounts resolve on the Docker host, not inside the agent, so the pipeline
does not bind-mount the agent workspace into test containers. Instead,
`run-tests.sh` copies each project's output from its stopped container into a
separate workspace directory before deleting the container.

Jenkins's **Artifacts** link provides downloadable output. HTML reports can be
downloaded and viewed with `npx playwright show-report <report-directory>`.

PR webhook delivery is configured separately from this file. Until configured,
use **Scan Multibranch Pipeline Now** to discover pushed changes. Only run trusted
PR code on this local agent: its Docker socket access controls Docker Desktop.
