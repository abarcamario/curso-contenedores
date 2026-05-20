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
                    // Cargamos de forma segura las credenciales de Jenkins creadas al principio
                    withCredentials([
                        usernamePassword(credentialsId: 'dh-credencial', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS'),
                        usernamePassword(credentialsId: 'gh-credencial', usernameVariable: 'GH_USER', passwordVariable: 'GH_PASS')
                    ]) {
                        sh '''
                            # Creamos la estructura de directorios requerida por Kaniko
                            mkdir -p /kaniko/.docker
                            
                            # Convertimos los accesos a formato Base64 sin saltos de línea
                            DH_AUTH=$(echo -n "${DH_USER}:${DH_PASS}" | base64 | tr -d '\n')
                            GH_AUTH=$(echo -n "${GH_USER}:${GH_PASS}" | base64 | tr -d '\n')
                            
                            # Generamos el archivo config.json dinámicamente con las credenciales
                            cat <<EOF > /kaniko/.docker/config.json
                            {
                                "auths": {
                                    "https://docker.io": { "auth": "${DH_AUTH}" },
                                    "https://ghcr.io": { "auth": "${GH_AUTH}" }
                                }
                            }
                            EOF
                            
                            # Ejecutamos el compilador de Kaniko autenticado
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
}
