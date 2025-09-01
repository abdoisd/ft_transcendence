#!/bin/bash

# take environment variables from .env file
source .env

# Wait for Elasticsearch to be healthy (response code 200)
echo "Waiting for Elasticsearch to become available..."
until curl -s -k https://127.0.0.1:9200 >/dev/null 2>&1; do
    echo "Waiting for Elasticsearch..."
    sleep 1
done

echo "Elasticsearch is running. Beginning setup..."

# 1. Create the Snapshot Repository
echo "Creating snapshot repository 'my_backup_repo'..."

curl -s -k -X PUT -u "elastic:${ELASTIC_PASSWORD}" \
  "https://127.0.0.1:9200/_snapshot/my_backup_repo?pretty" \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "fs",
    "settings": {
      "location": "/usr/share/elasticsearch/snapshots/my_backup_repo"
    }
  }'

# 2. Create the Snapshot Lifecycle Management (SLM) Policy
echo "Creating SLM policy 'my_archive_policy'..."
curl -s -k -X PUT -u "elastic:${ELASTIC_PASSWORD}" "https://127.0.0.1:9200/_slm/policy/my_archive_policy?pretty" -H 'Content-Type: application/json' -d'
{
  "schedule": "0 0 * * * ?",
  "name": "test-logs-archive",
  "repository": "my_backup_repo",
  "config": {
    "indices": ["test-logs-*"],
    "include_global_state": false
  },
  "retention": {
    "expire_after": "30d",
    "min_count": 5,
    "max_count": 50
  }
}
'

# 3. Create the Index Lifecycle Management (ILM) Policy
echo "Creating ILM policy 'my_quick_test_policy'..."
curl -s -k -X PUT -u "elastic:${ELASTIC_PASSWORD}" "https://127.0.0.1:9200/_ilm/policy/my_quick_test_policy?pretty" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "set_priority": {
            "priority": 100
          },
          "rollover": {
            "max_age": "1m",
            "max_docs": 10,
            "max_primary_shard_size": "500b",
            "max_size": "500b"
          }
        }
      },
      "warm": {
        "min_age": "1m",
        "actions": {
          "set_priority": {
            "priority": 50
          }
        }
      },
      "cold": {
        "min_age": "2m",
        "actions": {
          "set_priority": {
            "priority": 0
          }
        }
      },
      "delete": {
        "min_age": "3m",
        "actions": {
          "delete": {
            "delete_searchable_snapshot": true
          },
          "wait_for_snapshot": {
            "policy": "my_archive_policy"
          }
        }
      }
    }
  }
}
'

# 4. Create the Index Template
echo "Creating index template 'my_ilm_template'..."
curl -s -k -X PUT -u "elastic:${ELASTIC_PASSWORD}" "https://127.0.0.1:9200/_index_template/my_ilm_template?pretty" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["test-logs-*"],
  "template": {
    "settings": {
      "index.lifecycle.name": "my_quick_test_policy",
      "index.lifecycle.rollover_alias": "test-logs"
    }
  }
}
'

# 5. Create the Initial Bootstrapped Index
echo "Creating initial index 'test-logs-000001'..."
curl -s -k -X PUT -u "elastic:${ELASTIC_PASSWORD}" "https://127.0.0.1:9200/test-logs-000001?pretty" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "index.lifecycle.name": "my_quick_test_policy",
    "index.lifecycle.rollover_alias": "test-logs",
    "index.number_of_replicas": 0
  },
  "aliases": {
    "test-logs": {
      "is_write_index": true
    }
  }
}
'

echo "All setup operations completed successfully!"
