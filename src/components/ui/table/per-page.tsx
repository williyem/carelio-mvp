import { Table } from '@tanstack/react-table';

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}
export function PerPage<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-row space-x-5 items-center px-5 py-5">
      <h1 className=" text-(--text-primary)  max-sm:hidden font-semibold text-sm min-w-[100px]  ">
        Rows Per Page
      </h1>
      <select
        value={`${table.getState().pagination.pageSize}`}
        onChange={(e) => {
          table.setPageSize(Number(e.target.value));
        }}
        className="text-sm w-full   p-[5px] input focus:ring-4 focus:outline-none focus:ring-gray-100 "
      >
        {[10, 20, 30, 40, 50]?.map((pageNumber, idx: number) => {
          return (
            <option
              key={idx}
              value={pageNumber}
              className="input text-sm w-full"
            >
              {pageNumber}
            </option>
          );
        })}
      </select>
    </div>
  );
}

export default PerPage;
