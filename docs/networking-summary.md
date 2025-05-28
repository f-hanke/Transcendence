
---

### 🔍 **Monitoring and Observability Services**

| Port | Service       | Description                  | Host Binding             |
| ---- | ------------- | ---------------------------- | ------------------------ |
| 9200 | Elasticsearch | REST API for indexing/search | `127.0.0.1:9200`         |
| 5601 | Kibana        | UI for Elasticsearch         | `127.0.0.1:5601`         |
| 5044 | Logstash      | Beats input (e.g., Filebeat) | `127.0.0.1:5044`         |
| 5000 | Logstash      | Custom TCP/UDP input         | `127.0.0.1:5000/tcp/udp` |
| 9600 | Logstash      | Monitoring API               | `127.0.0.1:9600`         |
| 9090 | Prometheus    | Metrics query UI             | `127.0.0.1:9090`         |
| 3000 | Grafana       | Dashboards and visualization | `127.0.0.1:3000`         |

---

### 🌐 **Application Gateway**

| Port | Service     | Description                | Host Binding   |
| ---- | ----------- | -------------------------- | -------------- |
| 8443 | API Gateway | HTTPS endpoint for clients | `0.0.0.0:8443` |

---

### 🔧 **Internal Microservices** (only internally exposed)

| Port  | Service      | Description                   | Exposed Internally |
| ----- | ------------ | ----------------------------- | ------------------ |
| 10005 | Webserver    | Frontend/backend server       | ✅ `expose: 10005`  |
| 10004 | Users/Auth   | Auth & user management        | ✅ `expose: 10004`  |
| 10002 | Remote       | Matchmaking service           | ✅ `expose: 10002`  |
| 10003 | Game Service | Game logic and state handling | ✅ `expose: 10003`  |
| 10001 | Chat Service | Chat functionality            | ✅ `expose: 10001`  |

These internal services **do not bind to the host**, they are only accessible within the Docker networks.

---

### ⚠️ Notes:

* All ports bound to `127.0.0.1` are **only accessible from the host machine**, not from other devices.
* Only the `api-gateway` is publicly exposed via `0.0.0.0:8443` (HTTPS).
* `expose` simply makes ports available to other containers on the same network—**not to the host**.
