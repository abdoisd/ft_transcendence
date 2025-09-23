until curl -s http://elasticsearch:9200 > /dev/null; do
  echo "Waiting for Elasticsearch..."
  sleep 2
done

curl -u $ELASTIC_SEARCH_USERNMAE:$ELASTIC_SEARCH_PASSWORD \
  -X PUT "http://elasticsearch:9200/_security/user/kibana_system/_password" \
  -H "Content-Type: application/json" \
  -d "{
    \"password\": \"${KIBANA_PASSWORD}\"
  }"



curl -u $ELASTIC_SEARCH_USERNMAE:$ELASTIC_SEARCH_PASSWORD \
  -X PUT "http://elasticsearch:9200/_ilm/policy/trans_policy" \
  -H "Content-Type: application/json" \
  -d '{
    "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_age": "30d",
            "max_size": "50gb"
          }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'


curl -u $ELASTIC_SEARCH_USERNMAE:$ELASTIC_SEARCH_PASSWORD \
  -X PUT "http://elasticsearch:9200/_index_template/trans_logs_template" \
  -H "Content-Type: application/json" \
  -d '{
      "index_patterns": ["logs-*"],
			"template": {
				"settings": {
					"index": {
						"lifecycle": {
							"name": "trans_policy"
						}
					}
				}
			},
      "priority": 9999999
}'


echo "DONE";