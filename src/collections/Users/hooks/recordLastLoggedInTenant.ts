import type { AfterLoginHook } from 'payload/dist/collections/config/types'

export const recordLastLoggedInTenant: AfterLoginHook = async ({ req, user }) => {
  try {
    const relatedOrg = await req.payload.find({
      collection: 'tenants',
      where: {
        'domains.domain': {
          in: [req.headers.host],
        },
      },
      depth: 0,
      limit: 1,
    })

    if (relatedOrg.docs.length > 0) {
      let updateSuccess = false
      let attempts = 3 // You can adjust the number of attempts as needed

      while (!updateSuccess && attempts > 0) {
        try {
          await req.payload.update({
            id: user.id,
            collection: 'users',
            data: {
              lastLoggedInTenant: relatedOrg.docs[0].id,
            },
          })
          updateSuccess = true // Update successful, break out of loop
        } catch (err: unknown) {
          req.payload.logger.error(
            `Error recording last logged in tenant for user ${user.id}: ${err}`,
          )
          attempts--
        }
      }

      if (!updateSuccess) {
        req.payload.logger.error(
          `Failed to record last logged in tenant after multiple attempts for user ${user.id}`,
        )
      }
    }
  } catch (err: unknown) {
    req.payload.logger.error(`Error recording last logged in tenant for user ${user.id}: ${err}`)
  }

  return user
}
