FROM cimg/android:2025.02-node

WORKDIR /app
USER root
COPY ./../ /app/

RUN apt update && \
    apt install -y ninja-build && \
    mkdir -p /root/.gradle && \
    cp ./docker/gradle.properties /root/.gradle/gradle.properties && \
    chmod +x ./docker/entrypoint.sh

ENV PATH="${ANDROID_HOME}/build-tools/35.0.0:${PATH}"
ENV GRADLE_HOME="~/.gradle"
VOLUME [ "/output" ]

ENTRYPOINT [ "./docker/entrypoint.sh" ]
