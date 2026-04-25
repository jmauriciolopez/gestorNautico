import { SetMetadata } from '@nestjs/common';

export const IS_GLOBAL_ROUTE_KEY = 'isGlobalRoute';
export const GlobalRoute = () => SetMetadata(IS_GLOBAL_ROUTE_KEY, true);
