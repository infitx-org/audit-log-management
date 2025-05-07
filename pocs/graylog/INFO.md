https://github.com/Graylog2/docker-compose

- Run
```
docker compose up -d
```
- Check the log for graylog container, you can find something like this `Try clicking on http://admin:<find_password_in_container_logs>@0.0.0.0:9000`
- Click on that link and it will guide you for provisioning certificates
- After that, you can login with `admin` and `yourpassword` as username and password
- Goto `Streams` and click `teststream`