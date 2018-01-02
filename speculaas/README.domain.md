Create new domain in rackspace, app.houseofmoran.com

Create hosted zone:

    ID=$(uuidgen) && aws route53 create-hosted-zone --name app.houseofmoran.com --caller-reference $ID | jq .DelegationSet.NameServers
    
Add all NameServers above as NS records, and then delete all previous NS (rackspace doesn't allow you to delete all NS first,
which makes sense)

Useful:

https://www.whatsmydns.net/#NS/app.houseofmoran.com

and

https://www.whatsmydns.net/#A/api.app.houseofmoran.com

