#!/bin/bash
set -e
P=precise-office-485714-i8
R=me-central1
echo "Creating serverless NEG..."
gcloud beta compute network-endpoint-groups create arqos-neg --region=$R --network-endpoint-type=serverless --cloud-run-service=arqos-bot --project=$P
echo "Creating backend service..."
gcloud compute backend-services create arqos-backend --global --project=$P
echo "Adding backend..."
gcloud compute backend-services add-backend arqos-backend --global --network-endpoint-group=arqos-neg --network-endpoint-group-region=$R --project=$P
echo "Creating URL map..."
gcloud compute url-maps create arqos-urlmap --default-service=arqos-backend --project=$P
echo "Creating SSL cert..."
gcloud compute ssl-certificates create arqos-cert --domains=realco.ai,www.realco.ai --global --project=$P
echo "Creating HTTPS proxy..."
gcloud compute target-https-proxies create arqos-https-proxy --ssl-certificates=arqos-cert --url-map=arqos-urlmap --project=$P
echo "Creating forwarding rule..."
gcloud compute forwarding-rules create arqos-https-rule --global --target-https-proxy=arqos-https-proxy --ports=443 --project=$P
echo "Getting IP address..."
gcloud compute forwarding-rules describe arqos-https-rule --global --format="value(IPAddress)" --project=$P
echo "DONE - Point realco.ai A record to the IP above"
