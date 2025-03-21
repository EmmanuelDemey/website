---
title: "Utilisation de TestContainer pour vérifier le comportement de requêtes SparQL"
description: "Comment vérifier le bon fonctionnement de requêtes SparQL avec TestContainer ?"
keywords: "testcontainer, docker, test"
pubDate: "07/30/2024"
---

Pour l'un de mes clients, j'ai été chargé de développer une application en React.js. En parallèle, je travaille également sur une partie de l'API en utilisant Spring Boot. Cette API interagit avec une base de données GraphDB, permettant ainsi une gestion efficace des données structurées et interconnectées. Pour effectuer des requêtes sur cette base de données, nous utilisons le langage SPARQL, qui est spécifiquement conçu pour interroger les graphes de données.

Récemment, nous avons ressenti le besoin de garantir l'absence de régressions dans nos requêtes SPARQL, car cette partie de l'application était la seule à ne pas être correctement testée. Nous voulions nous assurer que, pour un ensemble de données donné, une requête de notre application renverrait les résultats attendus. Pour cela, il était nécessaire de pouvoir déployer une base de données GraphDB pour nos tests, à la fois en local et sur notre infrastructure d'intégration continue (CI). C'est à ce moment-là que Testcontainers, un outil que j'avais en tête depuis un certain temps, est devenu indispensable.

Testcontainers est une solution open-source qui permet de démarrer des images Docker de manière programmatique. Il propose par défaut plusieurs intégrations pour des outils open-source couramment utilisés, comme Redis, Elasticsearch, et MySQL. Cependant, aucune intégration spécifique pour GraphDB n'était disponible. Heureusement, cela ne pose pas de problème majeur, car avec Testcontainers, nous pouvons en réalité lancer n'importe quelle image Docker.

Dans cet article, je vais détailler la mise en place de cette solution, et vous verrez que c'est assez simple, même pour quelqu'un comme moi qui n'est pas un développeur Java. Je vais vous guider à travers chaque étape pour vous montrer comment utiliser Testcontainers pour déployer une instance de GraphDB et garantir ainsi la stabilité de vos requêtes SPARQL.

Nous allons tout d’abord ajouter deux librairies :

- `org.testcontainers:testcontainers`: la librairie principale
- `org.testcontainers:junit-jupiter` : une librairie permettant de simplifier l’utilisation de TestContainer dans des tests jUnit.

Nous allons ensuite créer notre propre implémentation de GenericContainer pour GraphDB afin de le rendre réutilisable dans tous nos tests. Cette classe nous permettra, par exemple, d'exécuter des scripts à l'intérieur du conteneur créé. Cela sera particulièrement utile pour initialiser le dépôt GraphDB (l'endroit où les données sont stockées) et éventuellement y enregistrer les données nécessaires pour les tests. Vous pouvez créer autant de méthodes utilitaires que vous le souhaitez, en fonction de l'expérience développeur que vous désirez offrir avec votre intégration. Comme GraphDB est une base de données accessible via une API, il suffit d'envoyer des requêtes HTTP à l'intérieur du conteneur pour interagir avec elle.

Ci-dessus, la méthode withRepository sera utilisé pour initialiser le dépôt dans lequel les données seront stockées. Et la méthode withTrigFile permettra d’uploader des fichiers TRIG nous permettant d’initialiser un jeu de donnée.

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

Nous pouvons désormais utiliser notre classe GraphDBContainer. Toutefois, avant de l'intégrer pleinement, il est essentiel de synchroniser l'URL et le port de notre conteneur avec la configuration de l'application Spring Boot. Si cette étape n'est pas réalisée correctement, notre service FriendsService risque de se connecter à la mauvaise base de données, ce qui pourrait entraîner des erreurs dans les tests et le fonctionnement de l'application. Pour synchroniser l'URL et le port de notre conteneur avec la configuration de l'application Spring Boot, nous utilisons les DynamicPropertySource de Spring Boot.

Les annotations @Testcontainers et @Container sont des outils pratiques qui simplifient l'utilisation de Testcontainers dans JUnit. Elles automatisent le démarrage et l'arrêt des conteneurs, ce qui facilite la gestion des environnements de test.

Une fois cette étape accomplie, nous pouvons charger un fichier TRIG en utilisant la méthode withTrigFile que nous avons implémentée précédemment, et exécuter enfin notre test.

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

import static org.junit.jupiter.api.Assertions.\*;

@SpringBootTest
@TestContainers
public class TestContainerTest {
@Autowired
FriendsService friendsService;

    @Container
    public static GraphDBContainer container = new GraphDBContainer("ontotext/graphdb:10.6.4");


    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        String server = "http://" + container.getHost() + ":" + container.getMappedPort(7200);
        registry.add("fr.insee.rmes.bauhaus.sesame.gestion.sesameServer", () - server);
        registry.add("fr.insee.rmes.bauhaus.sesame.gestion.repository", () - "repository");
    }

    @Test
    void should_test_something() {
      container.withTrigFiles("sample-data.trig");
      assertEquals(10, friendsService.getFriends().length());
    }

}
```

La prochaine étape consiste à ajouter des tests pour vérifier l'intégration correcte de Minio et Keycloak dans notre projet. Ces tests garantiront que ces composants sont bien configurés et fonctionnent comme prévu, assurant ainsi la robustesse et la sécurité de notre application.
