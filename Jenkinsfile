pipeline {
    agent none
    
    environment {
        IMAGE_NAME = 'curso-contenedores'
        DH_REPO    = 'carlosmarind/curso-contenedores'
        GH_REPO    = 'ghcr.io/carlosmarind/curso-contenedores'
    }
    
    stages {
        stage('CI - de nuestra aplicacion de contenedores') {
            agent {
                docker {
                    image 'ghcr.io/pnpm/pnpm:latest'
                    label 'docker'
                }
            }
            
            stages {
                stage('CI - Configuracion de pnpm y node') {
                    steps {
                        sh '''
                            pnpm runtime set node 24 -g
                            pnpm --version
                        '''
                    }
                }
                
                stage('CI - Instalacion de dependencias') {
                    steps {
                        sh '''
                            pnpm install
                        '''
                    }
                }
                
                stage('CI - Revision de linter') {
                    steps {
                        sh '''
                            pnpm lint
                        '''
                    }
                }
                
                stage('CI - Ejecucion de build') {
                    steps {
                        sh '''
                            pnpm build
                        '''
                    }
                }
            }
        }
        
        stage('CD - Empaquetado y distribucion') {
            agent { 
                label 'docker' 
            }
            steps {
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
