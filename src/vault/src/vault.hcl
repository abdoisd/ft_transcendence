api_addr                = "https://127.0.0.1:8200"
cluster_addr            = "https://127.0.0.1:8201"
cluster_name            = "vault-cluster"
disable_mlock           = true
ui                      = true

listener "tcp" {
	address       = "0.0.0.0:8200"
	tls_cert_file = "/tmp/vault-cert.pem"
	tls_key_file  = "/tmp/vault-key.pem"
}

backend "raft" {
	path    = "/opt/vault/data"
	node_id = "vault-server"
}
