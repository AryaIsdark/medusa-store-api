import { MigrationInterface, QueryRunner } from "typeorm";

export class ErrorLog1691495884310 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "error_log" (
                    "id" character varying NOT NULL,
                    "entity_id" VARCHAR NOT NULL,
                    "error" TEXT NOT NULL,
                    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
                  )`
    );
    await queryRunner.createPrimaryKey("error_log", ["id"]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("error_log", true);
  }
}
