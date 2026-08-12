# Pagination System

This pagination system provides a flexible way to handle both server-side and client-side pagination in your Next.js application. It uses URL search parameters to manage pagination state, making it easy to share and bookmark specific pages.

## Components

### 1. Pagination Component (`pagination.tsx`)

A standalone UI component that displays pagination controls:

- Page navigation buttons
- Items per page selector
- Current page indicator

### 2. Pagination Hook (`usePagination.ts`)

A custom hook that manages pagination state using URL search parameters.

## Usage Examples

### Server-Side Pagination (with paginated API)

```tsx
import { usePagination } from '@/hooks/usePagination';
import { DataTable } from '@/components/ui/table/data-table';

export default function YourComponent() {
  // Use the pagination hook
  const { page, limit, getPaginationQueryParams } = usePagination({
    defaultPage: 1,
    defaultLimit: 10,
  });

  // Get data with pagination parameters
  const { data, isLoading } = useYourPaginatedAPI({
    ...getPaginationQueryParams(),
  });

  return (
    <DataTable
      data={data?.items || []}
      columns={columns}
      loading={isLoading}
      totalItems={data?.totalItems || 0}
      defaultItemsPerPage={limit}
      showPagination={true}
    />
  );
}
```

### Client-Side Pagination (with non-paginated API)

```tsx
import { usePagination } from '@/hooks/usePagination';
import { DataTable } from '@/components/ui/table/data-table';
import { Pagination } from '@/components/ui/table/pagination';

export default function YourComponent() {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use the pagination hook with clientSidePagination set to true
  const { limit, getClientPaginationDetails } = usePagination({
    defaultPage: 1,
    defaultLimit: 10,
    clientSidePagination: true,
  });

  // Fetch all data from a non-paginated API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await fetchAllData();
      setAllData(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Apply client-side pagination to the data
  const { paginatedData } = getClientPaginationDetails(allData);

  return (
    <>
      <DataTable
        data={paginatedData}
        columns={columns}
        loading={loading}
        totalItems={allData.length}
        defaultItemsPerPage={limit}
        showPagination={false} // We'll use our own pagination component
      />

      {/* Add pagination component separately */}
      {!loading && (
        <Pagination totalItems={allData.length} defaultItemsPerPage={limit} />
      )}
    </>
  );
}
```

## API Reference

### usePagination Hook

```tsx
const {
  page, // Current page number
  limit, // Items per page
  setPage, // Function to change page
  setLimit, // Function to change items per page
  getPaginationQueryParams, // Returns { page, limit } for API calls
  getClientPaginationDetails, // Client-side pagination helper
} = usePagination({
  defaultPage: 1, // Default page number
  defaultLimit: 10, // Default items per page
  clientSidePagination: false, // Set to true for client-side pagination
});
```

### Pagination Component

```tsx
<Pagination
  totalItems={100} // Total number of items
  defaultItemsPerPage={10} // Default items per page
  defaultPage={1} // Default page number
  pageSizeOptions={[10, 25, 50, 100]} // Available page size options
  className="my-4" // Optional CSS class
/>
```

### DataTable Component

```tsx
<DataTable
  data={data} // Data to display
  columns={columns} // Column definitions
  loading={isLoading} // Loading state
  totalItems={totalItems} // Total number of items
  defaultItemsPerPage={10} // Default items per page
  pageSizeOptions={[10, 25, 50, 100]} // Available page size options
  showPagination={true} // Whether to show pagination controls
  searchFields={['name', 'email']} // Fields to search
  hideHeader={false} // Whether to hide the table header
/>
```
