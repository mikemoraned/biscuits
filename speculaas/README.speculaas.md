# Speculaas

## one-off

Setup namespace, context:

    CLUSTER=minikube # or kops-apps2 etc
    USER=${CLUSTER}-admin
    kubectl config set-context speculaas-${CLUSTER} --cluster=${CLUSTER} --user=${USER}
    kubectl config use-context speculaas-${CLUSTER}
    kubectl apply -f k8s/namespace.yaml
    kubectl config set-context speculaas-${CLUSTER} --namespace=speculaas --cluster=${CLUSTER}

Use docker hub and switch to speculaas-kops context:

    kubectl config use-context speculaas-kops

## Build and push

    export DOCKER_ID_USER="houseofmoran"
    docker login

    docker build -t houseofmoran/speculaas-pieces-finder:9 ./pieces-finder
    docker build -t houseofmoran/speculaas-pieces-view:31 ./pieces-view

    docker push houseofmoran/speculaas-pieces-finder:9
    docker push houseofmoran/speculaas-pieces-view:31

## Ingress and services

    kubectl apply -f ./pieces-finder/k8s/service.yaml
    kubectl apply -f ./pieces-view/k8s/service.yaml
    kubectl apply -f ./k8s/ingress.yaml

## Deployments

    kubectl apply -f ./pieces-finder/k8s/deployment.yaml
    kubectl apply -f ./pieces-view/k8s/deployment.yaml
