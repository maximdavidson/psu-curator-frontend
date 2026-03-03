import Dexie, { type Table } from "dexie";
import type { IFileEntity } from "./types";

export class MyDatabase extends Dexie {
  files!: Table<IFileEntity, number>;

  constructor() {
    super("FileStorage");
    this.version(1).stores({
      files: "++id, name, type, size, createdAt"
    });
  }
}

export const db = new MyDatabase();

db.version(1).stores({
  files: "++id, name, type, size, content"
});
