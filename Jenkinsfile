pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    component: ci-pipeline
spec:
  containers:
  - name: pnpm
    image: ghcr.io/pnpm/pnpm:latest
    command: ['cat']
    tty: true
  - name: docker
    image: docker:24.0.7-dind
    securityContext:
      privileged: true
    command: ['cat']
    tty: true
'''
        }
    }
    
    environment {
        IMAGE_NAME = 'curso-contenedores'
        DH_REPO    = 'abarcamario/curso-contenedores'
        GH_REPO    = 'ghcr.io/abarcamario/curso-contenedores'
    }
    
    stages {
        stage('CI - de nuestra aplicacion de contenedores') {
            stages {
                stage('CI - Configuracion de pnpm y node') {
                    steps {
                        container('pnpm') {
                            sh '''
                                pnpm runtime set node 24 -g || true
                                pnpm --version
                            '''
                        }
                    }
                }
                
                stage('CI - Instalacion de dependencias') {
                    steps {
                        container('pnpm') {
                            sh '''
                                pnpm install
                            '''
                        }
                    }
                }
                
                stage('CI - Revision de linter') {
                    steps {
                        container('pnpm') {
                            sh '''
                                pnpm lint
                            '''
                        }
                    }
                }
                
                stage('CI - Ejecucion de build') {
                    steps {
                        container('pnpm') {
                            sh '''
                                pnpm build
                            '''
                        }
                    }
                }
            }
        }
        
        stage('CD - Empaquetado y distribucion') {
            steps {
                container('docker') {
                    sh '''
                        docker build -t ${IMAGE_NAME}:latest .
                        docker tag ${IMAGE_NAME}:latest ${DH_REPO}:latest
                        docker tag ${IMAGE_NAME}:latest ${GH_REPO}:latest
                    '''
                    
                    script {
                        docker.withRegistry('https://docker.io', 'dh-credencial') {
                            sh 'docker push ${DH_REPO}:latest'
                        }
                        
                        docker.withRegistry('https://ghcr.io', 'gh-credencial') {
                            sh 'docker push ${GH_REPO}:latest'
                        }
                    }
                }
            }
        }
    }
}
