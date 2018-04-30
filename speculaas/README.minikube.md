# Requirements

A minikube cluster, kubectl installed and a local docker setup.

# Setup

## Shared

Setup namespace, context:

    kubectl apply -f k8s/namespace.yaml
    kubectl config set-context speculaas-minikube --namespace=speculaas --cluster=minikube --user=minikube

Use minikube docker registry and switch to speculaas context:

    eval $(minikube docker-env)
    kubectl config use-context speculaas-minikube

## Build

    docker build -t houseofmoran/speculaas-pieces-finder:11 ./pieces-finder
    docker build -t houseofmoran/speculaas-pieces-view:30 ./pieces-view
    
## Startup

    kubectl apply -f ./pieces-finder/k8s/deployment.yaml
    kubectl apply -f ./pieces-finder/k8s/service.yaml
    kubectl apply -f ./pieces-view/k8s/deployment.yaml
    kubectl apply -f ./pieces-view/k8s/service.yaml

# Access

## piece-finder-service

    minikube service -n speculaas --url pieces-finder-service

## piece-view-service

    minikube service -n speculaas --url pieces-view-service
