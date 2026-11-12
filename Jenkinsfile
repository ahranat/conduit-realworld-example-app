pipeline {
    agent { label 'docker' }

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    parameters {
        string(name: 'BASE_URL', defaultValue: 'http://frontend:3000',
               description: 'E2E target. Defaults to the frontend built from this checkout.')
    }

    environment {
        COMPOSE_FILE = 'compose.ci.yaml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log -1 --oneline'
                script {
                    // BUILD_TAG identifies both the job/PR and this build.
                    def buildId = sh(
                        script: 'printf "%s" "$BUILD_TAG" | sha256sum | cut -c1-16',
                        returnStdout: true
                    ).trim()
                    env.COMPOSE_PROJECT_NAME = "conduit-ci-${buildId}"
                }
                sh 'rm -rf ci-artifacts && mkdir -p ci-artifacts'
            }
        }

        stage('Check tools and configuration') {
            steps {
                sh 'git --version'
                sh 'docker version'
                sh 'docker compose version'
                sh 'docker compose config --quiet'
            }
        }

        stage('Build images') {
            steps {
                sh 'docker compose build frontend backend tests'
            }
        }

        stage('Start app') {
            steps {
                sh 'docker compose up -d --no-build --wait --wait-timeout 120 database backend frontend'
            }
        }

        stage('Backend integration') {
            steps {
                sh 'sh jenkins/run-tests.sh be.integration'
            }
        }

        stage('E2E') {
            steps {
                sh 'sh jenkins/run-tests.sh e2e'
            }
        }
    }

    post {
        always {
            script {
                // Do not run cleanup against an unnamed/default project if checkout failed.
                if (env.COMPOSE_PROJECT_NAME) {
                    try {
                        sh(returnStatus: true, script: '''
                            mkdir -p ci-artifacts
                            docker compose logs --no-color > ci-artifacts/services.log 2>&1
                        ''')
                        archiveArtifacts artifacts: 'ci-artifacts/**/*', allowEmptyArchive: true
                    } finally {
                        // Only this build's resources; never use global Docker prune.
                        sh 'docker compose --profile test down --volumes --remove-orphans --rmi local'
                    }
                }
            }
        }
    }
}
