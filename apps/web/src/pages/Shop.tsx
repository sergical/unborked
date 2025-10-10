import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sale/shop');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600)',
            filter: 'brightness(0.6)'
          }}
        />
        <div className="relative max-w-7xl mx-auto h-full flex items-center px-4">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              Shop All Products
            </h1>
            <p className="text-xl text-gray-200">
              Browse our complete collection of developer tools
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold mb-8">
          All Products
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold mb-4">Error</h2>
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-red-500 hover:text-black"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-testid="product-grid"
          >
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Shop;
