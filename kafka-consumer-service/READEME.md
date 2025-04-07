### Kafka Configuration and UUID Generation

To initialize Kafka (without Zookeeper), ensure the following configurations are set in the respective files:

#### `server.properties`
```properties
process.roles=broker
node.id=1
log.dirs=./data/kafka
controller.quorum.voters=1@localhost:9093
listeners=PLAINTEXT://:9092
inter.broker.listener.name=PLAINTEXT
```

### Initialize Kafka

Before starting Kafka, initialize it using the following command:


Replace `[UUID]` with a randomly generated UUID, which can be created using the PowerShell command below:

``` powershell
[guid]::NewGuid()
```
This will output a new UUID each time it is executed.

```bash
.\bin\windows\kafka-storage.bat format -t [UUID] -c .\config\server.properties
```

Use the following command to start Kafka with the `server.properties` configuration:

```bash
.\bin\windows\kafka-server-start.bat .\config\kraft\server.properties
```