# Kibana Setup Guide

## 1. Access Kibana
- Open your browser and go to: http://localhost:5601
- Wait for Kibana to fully load (it may take a few minutes on first startup)

## 2. Create Index Pattern
1. Go to **Stack Management** → **Index Patterns**
2. Click **Create index pattern**
3. Enter index pattern: `microservices-logs-*`
4. Click **Next step**
5. Select **@timestamp** as the time field
6. Click **Create index pattern**

## 3. View Logs
1. Go to **Discover** in the left sidebar
2. Select your `microservices-logs-*` index pattern
3. You should now see logs from your microservices

## 4. Useful Filters
- Filter by service: `service: "webserver"`
- Filter by log level: `level: "error"`
- Filter by time range using the time picker

## 5. Create Visualizations
1. Go to **Visualize Library**
2. Click **Create visualization**
3. Choose visualization type (e.g., Line chart, Bar chart)
4. Select your index pattern
5. Configure metrics and buckets

## 6. Sample Queries
```
# All error logs
level: "error"

# Logs from specific service
service: "users-auth"

# Logs containing specific text
message: "login"

# Logs from last hour with errors
level: "error" AND @timestamp: [now-1h TO now]
```

## Troubleshooting
- If no logs appear, check that your services are running and generating logs
- Verify Logstash is receiving logs by checking its console output
- Ensure Elasticsearch is healthy: http://localhost:9200/_cluster/health 