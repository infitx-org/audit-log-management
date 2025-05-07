FROM apache/superset:latest
# Switching to root to install the required packages
USER root
RUN pip install trino
# Switching back to using the `superset` user
USER superset