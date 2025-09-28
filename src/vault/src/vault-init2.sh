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

# Secret engine
vault secrets enable -path=secret kv-v2
vault kv put secret/node-app CLIENT_SECRET=$CLIENT_SECRET \
	JWT_SECRET=$JWT_SECRET \
	ROOT_TOKEN=$ROOT_TOKEN2

echo VAULT_TOKEN=$ROOT_TOKEN > /me/.env

else
    echo "Vault is already initialized."
fi
