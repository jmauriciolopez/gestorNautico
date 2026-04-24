import { Repository, FindManyOptions, SelectQueryBuilder } from 'typeorm';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function paginate<T>(
  repoOrQueryBuilder: Repository<T> | SelectQueryBuilder<T>,
  query: PaginationQuery,
  options: FindManyOptions<T> = {},
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  let data: T[];
  let total: number;

  if ('getManyAndCount' in repoOrQueryBuilder) {
    [data, total] = await repoOrQueryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  } else {
    [data, total] = await repoOrQueryBuilder.findAndCount({
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
