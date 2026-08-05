export interface PrismaInfo {
  hasPrisma: boolean;
  datasource?: string;
  provider?: string | undefined;
  models: string[];
}