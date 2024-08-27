import { Prisma, PrismaClient } from "@prisma/client";
import { revalidateTag, unstable_cache } from "next/cache";

declare global {
  var db: PrismaClient<{
    omit: {
      user: {
        createdAt: true;
        updatedAt: true;
        password: true;
      };
    };
  }>;
}

const _prisma =
  global.db ||
  new PrismaClient({
    log: [],
    omit: {
      user: {
        createdAt: true,
        updatedAt: true,
        password: true,
      },
    },
  });

if (process.env.NODE_ENV === "development") global.db = _prisma;

const getContext = (_this: any) => Prisma.getExtensionContext(_this);

export type FindManyArgs<T> = Prisma.Args<T, "findMany">;
export type FindManyResult<T> = Prisma.Result<T, null, "findMany">;
type CacheStrategy = {
  swr?: number;
  ttl?: number;
  key?: string;
};

const cachingExtensions = Prisma.defineExtension({
  name: "Caching Extensions",
  model: {
    $allModels: {
      async findManyCached<
        T,
        A,
        R extends Prisma.Result<T, A, "findMany">,
        R2 extends {
          result: R;
          cachedAt: Date;
          stateTime: number;
        } & CacheStrategy,
        ARGS extends Prisma.Exact<
          A,
          Prisma.Args<T, "findMany"> &
            CacheStrategy & {
              expandedOutput?: boolean;
            }
        >,
      >(
        this: T,
        _args: ARGS,
      ): Promise<ARGS extends { expandedOutput: true } ? R2 : R> {
        const {
          ttl = 10,
          expandedOutput,
          swr: _swr,
          key,
          ...args
        } = _args as any;
        const { swr = ttl + 10 } = _args as any;
        const ctx = getContext(this);
        const tags = ["findManyCached", `findManyCached-${ctx.name}`];
        if (key) tags.push(key);

        const cb = () =>
          unstable_cache(
            async (args) => {
              const result = (await ctx.findMany(args)) as R;
              return {
                result,
                cachedAt: new Date(),
              };
            },
            tags,
            {
              revalidate: ttl,
              tags,
            },
          )(args);

        let { result, cachedAt } = await cb();

        let staleTime = Math.ceil((+new Date() - +new Date(cachedAt)) / 1000);

        const isFresh = staleTime < ttl;

        if (!isFresh) {
          revalidateTag(tags[0]);
          const res = await cb();
          result = res.result;
          cachedAt = res.cachedAt;
          staleTime = Math.ceil((+new Date() - +new Date(cachedAt)) / 1000);
        }

        if (expandedOutput) {
          return {
            result,
            staleTime,
            ttl,
            swr,
            cachedAt,
            timestamp: new Date(),
          } as any;
        }

        return result as any;
      },
    },
  },
});

const prismaExtensions = Prisma.defineExtension({
  name: "Prisma Extensions",
  model: {
    $allModels: {
      async distinct<T1, T2 extends FindManyResult<T1>>(
        this: T1,
        field: keyof T2[0] | (keyof T2[0])[],
        where?: Prisma.Args<T1, "findMany">["where"],
        { take = undefined, ttl = 86400 } = {},
      ) {
        const ctx = getContext(this);

        const args = {
          where,
          distinct: field,
          take,
          ttl,
          key: `${ctx.name}-distinct`,
        };

        if (Array.isArray(field)) {
          const result: T2 = await ctx.findManyCached({
            ...args,
            select: field.reduce((p, c) => ({ ...p, [c]: true }), {}),
          });

          return result;
        }
        const result: T2 = await ctx.findManyCached({
          ...args,
          select: { [field]: true },
        });

        return result
          .map((p: T2[0]) => p[field])
          .flat()
          .filter(Boolean);
      },

      async exists<T>(this: T, where: FindManyArgs<T>["where"]) {
        return !!(await getContext(this).findFirst({
          where,
        }));
      },
    },
  },
});

const prisma = _prisma.$extends(cachingExtensions).$extends(prismaExtensions);

export default prisma;
