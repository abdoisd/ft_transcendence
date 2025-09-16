until curl -s http://elasticsearch:9200 > /dev/null; do
  echo "Waiting for Elasticsearch..."
  sleep 2
done

curl -u elastic:$ELASTIC_PASSWORD -X PUT "http://elasticsearch:9200/_security/user/kibana_system/_password" \
  -H "Content-Type: application/json" \
  -d "{
    \"password\": \"${KIBANA_PASSWORD}\"
  }"

echo "DONE";