kubectl -n mojaloop apply -f kafkacat-job.yaml

kubectl cp mojaloop/kafka-kcat-consumer-job-kjhxl:/tmp/kafka-dump.txt ./kafka-dump.txt


cat kafka-dump.txt | docker run -i --log-driver=none -a stdin -a stdout -a stderr --network=test-net edenhill/kcat:1.7.1 -b kafka:29092 -t topic-event-audit -X topic.partitioner=murmur2_random -K\|
