import { Client } from '@elastic/elasticsearch';
const esClient = new Client({ node: 'http://elasticsearch:9200' });
export async function checkElasticsearch() {
    try {
        const result = await esClient.ping();
        console.log("✅ Elasticsearch is reachable");
    }
    catch (err) {
        console.error("❌ Could not connect to Elasticsearch:", err);
        process.exit(1);
    }
}
export default esClient;
