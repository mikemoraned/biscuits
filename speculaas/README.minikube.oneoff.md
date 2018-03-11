# Requirements

A minikube cluster, kubectl installed and a local docker setup.

# Ingress

Enable the addon

    minikube addons enable ingress

## .minikube domain

(below inspired/taken from https://deis.com/docs/workflow/quickstart/provider/minikube/dns/)

install dnsmasq

    brew install dnsmasq

configure `.minikube` subdomains to always use minikube IP

    echo "address=/.minikube/`minikube ip`" >> /usr/local/etc/dnsmasq.conf
    sudo brew services start dnsmasq

make the system resolver use dnsmasq to resolve addresses:

    sudo mkdir /etc/resolver
    echo nameserver 127.0.0.1 | sudo tee /etc/resolver/minikube

you might need to clear the DNS resolver cache:

    sudo killall -HUP mDNSResponder
    
## usage in ingress files

you can now use a name like "foo.minikube" in an Ingress definition and it will be routed to the local minikube
cluster and will be picked up by the ingress controller