# Prerequisites

* a local docker setup
* minikube tools installed

# Minikube setup

Create a new cluster

    minikube start --vm-driver=virtualbox --bootstrapper=kubeadm --extra-config=apiserver.ServiceClusterIPRange=10.0.0.0/24

If you've previously created a cluster then the minikube ip may have changed, so first do:

    sudo route -n delete 10.0.0.0/24
    
Then make services reachable as if on local network:

    sudo route -n add 10.0.0.0/24 $(minikube ip)

You should now be able to use commands like the following to directly access ClusterIPs:

    kubectl get -n kube-system service

# Setup

## Shared

Setup namespace, context:

    kubectl apply -f k8s/namespace.yaml
    kubectl config set-context speculaas-minikube --namespace=speculaas --cluster=minikube --user=minikube

Use minikube docker registry and switch to speculaas context:

    eval $(minikube docker-env)
    kubectl config use-context speculaas-minikube
    
## Build and start piece-finder

    docker build -t houseofmoran/speculaas-pieces-finder:4 ./pieces-finder
    kubectl apply -f ./pieces-finder/k8s/deployment.yaml
    kubectl apply -f ./pieces-finder/k8s/service.yaml

## Build and start piece-view

    docker build -t houseofmoran/speculaas-pieces-view:5 ./pieces-view
    kubectl apply -f ./pieces-view/k8s/deployment.yaml
    kubectl apply -f ./pieces-view/k8s/service.yaml

# Access

If you have made services routable, then you can just do

    

## piece-finder-service

    minikube service -n speculaas --url pieces-finder-service

## piece-view-service

    minikube service -n speculaas --url pieces-view-service
