FROM cimg/android:2025.02-node

WORKDIR /app
COPY ./../ /app

ENV PATH "${ANDROID_HOME}/build-tools/36.*:${PATH}"

VOLUME [ "/output" ]

ENTRYPOINT [ "./docker/entrypoint.sh" ]
