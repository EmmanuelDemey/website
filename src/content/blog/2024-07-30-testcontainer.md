---
title: "Using Testcontainers to Verify SPARQL Query Behavior"
description: "How can we ensure SPARQL queries work correctly with Testcontainers?"
keywords: "testcontainers, docker, test"
pubDate: "07/30/2024"
---

For one of my clients, I was tasked with developing a React.js application. At the same time, I also worked on part of the API using Spring Boot. This API interacts with a **GraphDB** database, allowing efficient management of structured and interconnected data. To query this database, we use the **SPARQL** language, specifically designed for querying graphs of data.

Recently, we felt the need to guarantee the absence of regressions in our SPARQL queries, as this part of the application was the only one not properly tested. We wanted to ensure that, for a given dataset, a query from our application would return the expected results. To achieve this, we needed to deploy a **GraphDB instance** for our tests, both locally and in our CI environment. That’s when **Testcontainers**, a tool I had been considering for a while, became essential.

**Testcontainers** is an open-source solution that allows us to start Docker images programmatically. It comes with built-in integrations for popular tools like Redis, Elasticsearch, and MySQL. However, no specific integration existed for GraphDB. Fortunately, that’s not a major issue, since Testcontainers can run any Docker image.

In this article, I’ll detail how to set up this solution. You’ll see it’s quite simple — even for someone like me who is not primarily a Java developer. I’ll guide you step by step on how to use Testcontainers to deploy a GraphDB instance and guarantee the stability of your SPARQL queries.

### Adding the required libraries

We start by adding two libraries:

- `org.testcontainers:testcontainers`: the main Testcontainers library
- `org.testcontainers:junit-jupiter`: provides convenient JUnit 5 integration

### Creating a custom GraphDB container

We then create our own implementation of `GenericContainer` for GraphDB, making it reusable in all our tests. This class will also allow us to run scripts inside the container — useful for initializing the GraphDB repository and uploading any test data.

For example:

- `withRepository` initializes the repository where data will be stored.
- `withTrigFiles` uploads TRIG files to initialize a dataset.

```java
package fr.insee.rmes.testcontainers.queries;

import org.testcontainers.containers.Container;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.utility.MountableFile;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

public class GraphDBContainer extends GenericContainer {
    public static final String DOCKER_ENTRYPOINT_INITDB = "/docker-entrypoint-initdb";
    private String folder;

    public GraphDBContainer(final String dockerImageName) {
        super(dockerImageName);
        withExposedPorts(7200);
    }

    @Override
    public void start() {
        super.start();
        withInitFolder("/testcontainers").withExposedPorts(7200);
        withRepository("config.ttl");
    }

    public GraphDBContainer withInitFolder(String folder){
        this.folder = folder;
        return this;
    }

    public GraphDBContainer withRepository(String ttlFile) {
        try {
            String path = copyFile(ttlFile);
            execInContainer("curl", "-X", "POST", "-H", "Content-Type:multipart/form-data", "-F", "config=@" + path, "http://localhost:7200/rest/repositories");
        } catch (IOException | InterruptedException e) {
            throw new AssertionError("The TTL file was not loaded");
        }
        return this;
    }

    public GraphDBContainer withTrigFiles(String file) {
        try {
            String path = copyFile(file);
            execInContainer("curl", "-X", "POST", "-H", "Content-Type: application/x-trig", "--data-binary", "@" + path, "http://localhost:7200/repositories/bauhaus-test/statements");
        } catch (IOException | InterruptedException e) {
            throw new AssertionError("The Trig file was not loaded");
        }
        return this;
    }

    private String copyFile(String file) throws IOException, InterruptedException {
        String fullPath = DOCKER_ENTRYPOINT_INITDB  + "/" + file;
        copyFileToContainer(MountableFile.forClasspathResource(this.folder + "/" + file), fullPath);
        assertThatFileExists(file);
        return fullPath;
    }

    private void assertThatFileExists(String file) throws IOException, InterruptedException {
        Container.ExecResult lsResult = execInContainer("ls", "-al", DOCKER_ENTRYPOINT_INITDB);
        String stdout = lsResult.getStdout();
        assertThat(stdout).contains(file).withFailMessage("Expecting file %1$s to be in folder %2$s of container", file, DOCKER_ENTRYPOINT_INITDB);
    }
}
```

### Integrating with Spring Boot

We can now use our custom `GraphDBContainer`. But before fully integrating it, we must synchronize the container’s **URL and port** with Spring Boot’s configuration.

If not properly configured, our `FriendsService` might connect to the wrong database, causing errors. To synchronize, we use **Spring Boot’s `DynamicPropertySource`**.

The annotations `@Testcontainers` and `@Container` simplify container lifecycle management: they automatically start and stop containers during JUnit tests.

Once this is in place, we can load a TRIG file using our `withTrigFiles` method and finally execute our tests.

```java
package dev.emmanueldemey.TestContainerTest;

import dev.emmanueldemey.MyService;
import dev.emmanueldemey.GraphDBContainer;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
public class TestContainerTest {
    @Autowired
    FriendsService friendsService;

    @Container
    public static GraphDBContainer container = new GraphDBContainer("ontotext/graphdb:10.6.4");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        String server = "http://" + container.getHost() + ":" + container.getMappedPort(7200);
        registry.add("fr.insee.rmes.bauhaus.sesame.gestion.sesameServer", () -> server);
        registry.add("fr.insee.rmes.bauhaus.sesame.gestion.repository", () -> "repository");
    }

    @Test
    void should_test_something() {
        container.withTrigFiles("sample-data.trig");
        assertEquals(10, friendsService.getFriends().length());
    }
}
```

### Next steps

The next step is to add tests for integrating **Minio** and **Keycloak** into our project. These tests will ensure that these components are correctly configured and functioning as expected, guaranteeing both the robustness and the security of our application.
