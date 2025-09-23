#!/bin/bash

/usr/local/bin/vault-init2.sh &

vault server -config=/etc/vault.d/vault.hcl
