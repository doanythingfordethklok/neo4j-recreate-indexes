# CONFIG

The server config is in a file that looks like this. By default, index.js look at `./local.env.json`. It can be overridden like this `CONFIG=/path-to/file.env.json node index.js`.

```
{
  neo4j: {
    server: "bolt://localhost",
    user: "neo4j",
    pass: "neo4j"
  }
}
```
