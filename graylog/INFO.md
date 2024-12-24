https://github.com/Graylog2/docker-compose

- Run
```
docker compose up -d
```
- Check the log for graylog container, you can find something like this `Try clicking on http://admin:wDawekD@0.0.0.0:9000`
- Click on that link and it will guide you for provisioning certificates
- After that, you can login with `admin` and `yourpassword` as username and password
- Goto `System -> Inputs -> Content Packs` and click `Upload`
- Upload the content pack `content-pack-xxxxxx.json`
- Click `Install` on the uploaded content pack `kafkaaudits`
- Goto `System -> Inputs` and click `Show received messages` on the `testkafka1` input