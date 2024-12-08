export type Pagination = {
  page: number;
  limit: number;
};

export type DashboardType =
  | 'getByQuantity'
  | 'getByArea'
  | 'getByState'
  | 'getByCulture'
  | 'getBySoil';
