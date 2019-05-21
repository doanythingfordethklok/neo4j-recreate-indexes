const neo4j = require('neo4j-driver').v1;
const { argv } = require('yargs');
const config = require(argv.config || './local.env.json');
const driver = neo4j.driver(config.neo4j.server, neo4j.auth.basic(config.neo4j.user, config.neo4j.pass));
const session = driver.session();
const txn = session.beginTransaction();

const fetchIndexesFromDb = () => txn.run(`CALL db.indexes() YIELD description RETURN description`);
const fetchIndexesFromFile = async (filePath) => {
  const fsPromises = require('fs').promises;
  const file = await fsPromises.open(filePath, 'r');
  const raw = await file.readFile({ encoding: 'utf8' });

  await file.close();

  return raw.split('\n');
};

const fetchIndexes = async () => {
  if (argv.file) {
    return await fetchIndexesFromFile(argv.file);
  }

  return await fetchIndexesFromDb();
};

fetchIndexes()
  .then(async (idxs) => {
    let cmd;

    for(var i in idxs) {
      cmd = `DROP ${idxs[i]}`;
      console.log(cmd);
      await txn.run(cmd);

      cmd = `CREATE ${idxs[i]}`;
      console.log(cmd);
      await txn.run(cmd);
    }

    await txn.commit();
  })
  .then(async () => {
    await txn.commit();
    session.close();
    driver.close();
    process.exit();
  })
  .catch(async (e) => {
    console.error(e);

    await txn.rollback();
    session.close();
    driver.close();
    process.exit(1);
  });

