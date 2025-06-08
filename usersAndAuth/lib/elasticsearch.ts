import { Client } from '@elastic/elasticsearch';
import * as fs from 'fs';
import * as path from 'path';

// Configure Elasticsearch client for secured connection
const esClient = new Client({
  node: 'https://elasticsearch:9200',
  auth: {
    username: 'elastic',
    password: process.env.ELASTIC_PASSWORD || ''
  },
  tls: {
    ca: fs.readFileSync('/usr/share/elasticsearch/config/certs/ca/ca.crt'),
    rejectUnauthorized: true
  }
});

export async function checkElasticsearch() {
  try {
    const result = await esClient.ping();
    console.log("✅ Elasticsearch is reachable (secured)");
  } catch (err) {
    console.error("❌ Could not connect to Elasticsearch:", err);
    console.warn("⚠️  Continuing without Elasticsearch connection...");
    // process.exit(1);  // Don't exit, just continue without Elasticsearch
  }
}

export default esClient;