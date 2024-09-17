import initSqlJs from "sql.js";

// @ts-ignore
import sqlWasm from "sql.js/dist/sql-wasm.wasm?url"

export const SQL = await initSqlJs({
    locateFile: () => sqlWasm
})

export let DB = new SQL.Database();

export function overrideDB(data: Uint8Array) {
    DB = new SQL.Database(data);
}

export class Action {

    public static init() { }

}
