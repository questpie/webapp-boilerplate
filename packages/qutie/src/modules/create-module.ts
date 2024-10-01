// import {
//   type PgColumn,
//   type PgColumnBuilderBase,
//   pgTable,
//   type PgTableWithColumns,
//   varchar,
// } from 'drizzle-orm/pg-core'

// export type TableConfig = {
//   name: string
//   dbCol: PgColumnBuilderBase<any, any>
// }[]

// export type ModuleConfig<TModuleName extends string, TTableConfig extends TableConfig> = {
//   name: TModuleName
//   table: TTableConfig
// }

// function createModule<const TModuleName extends string, TTableConfig extends TableConfig>(
//   config: ModuleConfig<TModuleName, TTableConfig>
// ) {
// //   type TableColumns = {
// //     [K in TTableConfig[number]['name']]: Extract<TTableConfig[number], { name: K }>['dbCol']
// //   }

// //   const pgTableConfig = pgTable(
// //     config.name,
// //     Object.fromEntries(config.table.map(({ name, dbCol }) => [name, dbCol])) as TableColumns
// //   )

// //   return {
// //     table: pgTableConfig,
// //   }
// }

// // const organizations = createModule({
// //   name: 'organizations',
// //   table: [
// //     {
// //       name: 'name',
// //       dbCol: varchar('name', { length: 256 }).notNull(),
// //     },
// //     {
// //       name: 'ownerId',
// //       dbCol: varchar('ownerId', { length: 256 }).notNull(),
// //     },
// //   ],
// // })

// export { createModule }
