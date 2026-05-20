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
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug
    command: ['/busybox/cat']
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
                container('kaniko') {
                    sh '''
                        /kaniko/executor \
                          --context=. \
                          --dockerfile=./Dockerfile \
                          --destination=${DH_REPO}:latest \
                          --destination=${GH_REPO}:latest
                    '''
                }
            }
        }
    }
}
