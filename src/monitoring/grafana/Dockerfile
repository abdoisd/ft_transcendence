FROM grafana/grafana:main-ubuntu


COPY config/dashboard.yml /etc/grafana/provisioning/dashboards/dashboard.yml
COPY config/system_metrics.json /var/lib/grafana/dashboards/system_metrics.json
COPY config/prometheus.yml /etc/grafana/provisioning/datasources/prometheus.yml