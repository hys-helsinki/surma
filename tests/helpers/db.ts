import { PrismaClient } from "@prisma/client";
import { assertTestDatabaseUrl } from "./guard";

const url = assertTestDatabaseUrl(process.env.POSTGRES_URL);

export const prisma = new PrismaClient({ datasourceUrl: url });
