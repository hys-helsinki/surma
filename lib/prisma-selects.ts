export const umpirePagePlayerSelect = {
  id: true,
  title: true,
  alias: true,
  state: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true
    }
  },
  team: {
    select: {
      id: true,
      name: true
    }
  },
  umpire: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  },
  targets: true
} as const;
