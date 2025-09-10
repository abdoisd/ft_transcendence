VAULT_ADDR="https://127.0.0.1:8200"
INIT_FILE="vault_init.json"

echo "Waiting for Vault server to be ready..."
until curl -k -s --fail $VAULT_ADDR; do
    sleep 2
    echo "Vault is not ready yet. Retrying..."
done

# if not initialized
if ! vault status -address=$VAULT_ADDR -format=json | grep -q '"initialized": true'; then
echo "Vault not initialized. Initializing..."

vault operator init -key-shares=1 -key-threshold=1 -format=json > vault_init.json

# Extract unseal key and root token
UNSEAL_KEY=$(jq -r '.unseal_keys_b64[0]' "$INIT_FILE")
ROOT_TOKEN=$(jq -r '.root_token' "$INIT_FILE")

# print
echo "Unseal Key: $UNSEAL_KEY"
echo "Root Token: $ROOT_TOKEN"

# Unseal Vault
vault operator unseal "$UNSEAL_KEY"

# Login with root token
vault login "$ROOT_TOKEN"

# Audit log
mkdir -p /vault/logs
touch /vault/logs/audit.log
vault audit enable file file_path=/vault/logs/audit.log

# Auth method and users
vault auth enable userpass
vault write auth/userpass/users/admin password="pass" policies="admin-policy"
vault write auth/userpass/users/user1 password="pass" policies="elasticsearch-policy"
vault write auth/userpass/users/user2 password="pass" policies="grafana-policy"

# Secret engine
vault secrets enable -path=secret kv-v2
vault kv put secret/elasticsearch username="elastic" password="123456"
vault kv put secret/grafana admin_user="admin" admin_pass="pass"
vault kv put secret/node-app CLIENT_SECRET="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"

# Policies
vault policy write admin-policy - << EOF
path "*" {
  capabilities = ["create", "read", "update", "delete", "list", "sudo"]
}
EOF
vault policy write elasticsearch-policy - << EOF
path "secret/data/elasticsearch" {
  capabilities = ["read"]
}
EOF
vault policy write grafana-policy - << EOF
path "secret/data/grafana" {
  capabilities = ["read"]
}
EOF

echo VAULT_TOKEN=$ROOT_TOKEN > /me/.env


else
    echo "Vault is already initialized."
fi
