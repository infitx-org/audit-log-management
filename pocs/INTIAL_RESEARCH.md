# Docker Compose Stacks for Log Management PoC

This repository contains Docker Compose configurations to run Proof of Concepts (PoC) for various log management tools. The objective is to evaluate Loki, Graylog, and ClickHouse for handling audit logs based on specific requirements such as immutability, scalability, and resource efficiency.

## Tools and PoCs Included

1. **Loki**
   - A lightweight log aggregation system designed for high performance and efficiency.
   - Focused on indexing metadata.
   - Integrated with Grafana for visualization.

2. **Graylog (OpenSearch Backend)**
   - A powerful log management platform with OpenSearch as the backend.
   - Provides advanced search and visualization capabilities.
   - Useful for complex queries and structured log data.

3. **ClickHouse**
   - A high-performance columnar database for log storage and analytics.
   - Offers efficient resource usage and high ingestion rates.
   - Best suited for structured log data with predefined fields.

## Running all the tools and observing performance differences

1. Running Kafka and monitoring stack

```bash
cd kafka_audits
docker-compose up -d
cd ..

cd monitoring
docker-compose up -d
cd ..
```

2. Running ClickHouse, Graylog, and Loki

```bash
cd clickhouse
docker-compose up -d
cd ..

cd graylog
docker-compose up -d
cd ..

cd loki
docker-compose up -d
cd ..
```

3. Visualizing performance metrics in Grafana
- Open Grafana at `http://localhost:9999` and login with `admin:password`.
- Goto Dashboards and observe resource usage and performance metrics.

4. Visualizing audit logs in Grafana for Loki and ClickHouse
- Goto Explore and query logs from Loki and ClickHouse.

5. Visualizing audit logs in Graylog
- Check the log for graylog container, you can find something like this `Try clicking on http://admin:<password>@0.0.0.0:9000`
- Click on that link and it will guide you for provisioning certificates
- After that, you can login with `admin` and `yourpassword` as username and password
- Goto `Streams` and click `teststream`

6. Ingest data into Kafka
- Run the producer script to ingest data into Kafka topic
```bash
cd kafka_audits
gunzip kafka-dump.txt.gz
cat kafka-dump.txt | docker run -i --log-driver=none -a stdin -a stdout -a stderr --network=test-net edenhill/kcat:1.7.1 -b kafka:29092 -t topic-event-audit -X topic.partitioner=murmur2_random -K\|
cd ..
```

7. Observe how the audit logs are ingested and visualized in each tool
8. Observe the performance and resource usage of each tool


## Observations

- **Loki** is lightweight initially during ingestion but its taking up CPU after some time while flushing the data to storage.
- **Graylog** is powerful for unstructured data but it consume more resources among all. Its and end to end whole solution for log management. It offers various pipelines and rules to process and store the logs in the way we want.
- **ClickHouse** is efficient in terms of resource usage and performance but it requires structured data. If we can manage to align all the audit logs across different services in a structured way, ClickHouse can be a good choice. For this we need to understand the fields we will use for querying the logs and then we can create a schema accordingly. The pre-agreed fields can also appended to metadata of the logs.


