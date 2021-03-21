import { PostgreDB } from "@icfm/trust";

class AppConnections {
  private static createDBConn(connStr:string|undefined):PostgreDB {
    const db = new PostgreDB;
    if (connStr === undefined) throw new Error('Error getting DB connection parameters');
    const connCfg = JSON.parse(connStr);
    db.setConnection(connCfg.host, connCfg.user, connCfg.pass, connCfg.dbname, connCfg.port);
    return db;
  }
  
  public static getLocalDB():PostgreDB {
    return AppConnections.createDBConn(process.env.PGLOCAL);
  }
}
export default AppConnections;