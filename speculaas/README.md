# Requirements

A minikube cluster, kubectl installed and a local docker setup.

# Setup

## Shared

Setup namespace, context:

    kubectl apply -f k8s/namespace.yaml
    kubectl config set-context speculaas --namespace=speculaas --cluster=minikube --user=minikube

Use minikube docker registry and switch to speculaas context:

    eval $(minikube docker-env)
    kubectl config use-context speculaas
    
## Build and start piece-finder

    docker build -t speculaas-pieces-finder ./pieces-finder
    docker tag speculaas-pieces-finder speculaas-pieces-finder:1 
    kubectl apply -f ./pieces-finder/k8s/deployment.yaml
    kubectl apply -f ./pieces-finder/k8s/service.yaml

## Build and start piece-view

    docker build -t speculaas-pieces-view ./pieces-view
    docker tag speculaas-pieces-view speculaas-pieces-view:2 
    kubectl apply -f ./pieces-view/k8s/deployment.yaml
    kubectl apply -f ./pieces-view/k8s/service.yaml

# Access

## piece-finder-service

    minikube service -n speculaas --url pieces-finder-service

## piece-view-service

    minikube service -n speculaas --url pieces-view-service
