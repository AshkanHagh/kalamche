#!/bin/sh

TOPICS="product-created product-offer-created"
for topic in $TOPICS; do
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka-broker:29092 \
    --create --if-not-exists --topic "$topic"
done
