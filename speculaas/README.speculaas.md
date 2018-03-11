# Speculaas

## one-off

Setup namespace, context:

    CLUSTER=minikube # or kops-apps2 etc
    kubectl apply -f k8s/namespace.yaml
    kubectl config set-context speculaas-${CLUSTER} --namespace=speculaas --cluster=${NAME} --user=${NAME}

Use docker hub and switch to speculaas-kops context:

    export DOCKER_ID_USER="houseofmoran"
    docker login
    kubectl config use-context speculaas-kops

## Ingress and services
    
    kubectl apply -f ./pieces-finder/k8s/service.yaml
    kubectl apply -f ./pieces-view/k8s/service.yaml
    kubectl apply -f ./k8s/ingress.yaml
    
## Build and push

    docker build -t houseofmoran/speculaas-pieces-finder:9 ./pieces-finder
    docker build -t houseofmoran/speculaas-pieces-view:23 ./pieces-view
    
    docker push houseofmoran/speculaas-pieces-finder:9
    docker push houseofmoran/speculaas-pieces-view:23
        
## Deployments

    kubectl apply -f ./pieces-finder/k8s/deployment.yaml
    kubectl apply -f ./pieces-view/k8s/deployment.yaml
