import os
import pyrax

username = os.environ['RACKSPACE_USERNAME']
api_key = os.environ['RACKSPACE_API_KEY']

pyrax.set_setting("identity_type", "rackspace")

pyrax.set_credentials(username, api_key)

dns = pyrax.cloud_dns

for domain in dns.list():
    print domain
    print domain.export()

