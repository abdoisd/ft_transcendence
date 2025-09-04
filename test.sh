# Missing User-Agent (often flagged)
curl -i http://localhost:5000

# Rapid repeated requests
for i in {1..10}; do
  curl -i -H "User-Agent:" http://localhost:5000
done

# Invalid HTTP method
curl -X TRACE -i http://localhost:5000

# Missing common headers
curl -i -H "User-Agent:" -H "Accept:" http://localhost:5000
