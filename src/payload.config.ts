import { webpackBundler } from '@payloadcms/bundler-webpack'
// import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { slateEditor } from '@payloadcms/richtext-slate'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

import { buildConfig } from 'payload/config'

import { Pages } from './collections/Pages'
import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'

export default buildConfig({
  collections: [Users, Tenants, Pages],
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    webpack: config => ({
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          dotenv: path.resolve(__dirname, './dotenv.js'),
        },
      },
    }),
  },
  editor: slateEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  // db: mongooseAdapter({
  //   url: process.env.DATABASE_URI,
  //   connectOptions: {
  //     dbName: process.env.DATABASE_NAME,
  //   },
  // }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
})
