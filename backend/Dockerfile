FROM maven:3.9.9-eclipse-temurin-24 AS build
WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B clean verify

FROM scratch AS artifact
COPY --from=build /workspace/target/backend-*.jar /app.jar

FROM eclipse-temurin:24.0.2_12-jre-noble
WORKDIR /app
RUN apt-get update \
    && apt-get install --yes --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system agrocloud \
    && useradd --system --gid agrocloud agrocloud
COPY --from=build /workspace/target/backend-*.jar app.jar
USER agrocloud
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
