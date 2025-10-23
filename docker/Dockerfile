FROM cimg/android:2025.02-node

WORKDIR /app
COPY ./../ /app/

RUN chmod +x ./docker/entrypoint.sh

ENV PATH="${ANDROID_HOME}/build-tools/36.*:${PATH}"
VOLUME [ "/output" ]

ENTRYPOINT [ "./docker/entrypoint.sh" ]
