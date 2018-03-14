
export class PostgresQueryBuilder {
  constructor(private target, private queryModel) {}

  buildSchemaQuery() {
    var query = "SELECT schema_name FROM information_schema.schemata WHERE";
    query += " schema_name NOT LIKE 'pg_%' AND schema_name NOT LIKE '\\_%' AND schema_name <> 'information_schema';";

    return query;
  }

  buildTableQuery() {
    var query = "SELECT table_name FROM information_schema.tables WHERE ";
    query += "table_schema = " + this.queryModel.quoteLiteral(this.target.schema);
    return query;
  }

  buildColumnQuery(type?: string) {
    var query = "SELECT column_name FROM information_schema.columns WHERE ";
    query += "table_schema = " + this.queryModel.quoteLiteral(this.target.schema);
    query += " AND table_name = " + this.queryModel.quoteLiteral(this.target.table);

    switch (type) {
      case "time": {
        query += " AND data_type IN ('timestamp without time zone','timestamp with time zone','bigint','integer','double precision','real')";
        break;
      }
      case "metric": {
        query += " AND data_type IN ('text','char','varchar')";
        break;
      }
      case "value": {
        query += " AND data_type IN ('bigint','integer','double precision','real')";
        break;
      }
    }

    return query;
  }

  buildValueQuery(column: string) {
    var query = "SELECT DISTINCT " + this.queryModel.quoteIdentifier(column) + "::text";
    query += " FROM " + this.queryModel.quoteIdentifier(this.target.schema);
    query += "." + this.queryModel.quoteIdentifier(this.target.table);
    query += " ORDER BY " + this.queryModel.quoteIdentifier(column);
    query += " LIMIT 100";
    return query;
  }

  buildDatatypeQuery(column: string) {
    var query = "SELECT data_type FROM information_schema.columns WHERE ";
    query += " table_schema = " + this.queryModel.quoteLiteral(this.target.schema);
    query += " AND table_name = " + this.queryModel.quoteLiteral(this.target.table);
    query += " AND column_name = " + this.queryModel.quoteLiteral(column);
    return query;
  }

  buildAggregateQuery() {
    var query = "SELECT DISTINCT proname FROM pg_aggregate ";
    query += "INNER JOIN pg_proc ON pg_aggregate.aggfnoid = pg_proc.oid ";
    query += "INNER JOIN pg_type ON pg_type.oid=pg_proc.prorettype ";
    query += "WHERE pronargs=1 AND typname IN ('int8','float8') AND aggkind='n' ORDER BY 1";
    return query;
  }

}
