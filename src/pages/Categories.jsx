import useAsync from '../components/common/useAsync'
import { getCategories } from '../services/categoryService'
import CategoryCard from '../components/categories/CategoryCard'; import { CardSkeletons } from '../components/common/Skeleton'; import ErrorState from '../components/common/ErrorState'
export default function Categories() {
  document.title = 'Categories – GroupHub'
  const { data, loading, error, retry } = useAsync(getCategories, [])
  return <div className="mx-auto max-w-7xl px-4 py-10"><h1 className="mb-6 text-3xl font-extrabold">Categories</h1>
    {loading ? <CardSkeletons/> : error ? <ErrorState message={error} onRetry={retry}/> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map(c => <CategoryCard key={c.id} category={c}/>)}</div>}</div>
}
