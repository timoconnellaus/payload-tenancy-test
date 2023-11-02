import type { Access } from 'payload/config'

import type { User } from '../../../payload-types'
import { isSuperAdmin } from '../../../utilities/isSuperAdmin'

export const adminsAndSelf: Access<any, User> = async ({ req: { user } }) => {
  if (user) {
    const isSuper = isSuperAdmin(user)

    // allow super-admins through only if they have not scoped their user via `lastLoggedInTenant`
    if (isSuper && !user?.lastLoggedInTenant) {
      return true
    }

    // allow users to read themselves and any users within the tenants they are admins of
    return {
      or: [
        {
          id: {
            equals: user.id,
          },
        },
        ...(isSuper
          ? [
              {
                'tenants.tenant': {
                  in: [
                    typeof user?.lastLoggedInTenant === 'number'
                      ? user?.lastLoggedInTenant
                      : user?.lastLoggedInTenant?.id,
                  ].filter(Boolean),
                },
              },
            ]
          : [
              {
                'tenants.tenant': {
                  in:
                    user?.tenants
                      ?.map(({ tenant, roles }) =>
                        roles.includes('admin')
                          ? typeof tenant === 'number'
                            ? tenant
                            : tenant.id
                          : null,
                      ) // eslint-disable-line function-paren-newline
                      .filter(Boolean) || [],
                },
              },
            ]),
      ],
    }
  }
}
