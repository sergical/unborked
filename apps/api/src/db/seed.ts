import { db } from './index';
import { products, salePrices, productMetadata, saleCategories, users, purchases, userCarts, flagsTable } from './schema';

const saleProducts = [
  {
    name: 'Performance Profiler Pro',
    description: 'Advanced performance monitoring tool with real-time profiling, memory leak detection, and CPU usage analysis. Perfect for optimizing your applications.',
    price: '299.99',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    category: 'Performance',
    salePrice: '199.99',
    discount: '33.33',
    saleCategory: 'Black Friday',
    featured: true,
    priority: 100
  },
  {
    name: 'Security Scanner Elite',
    description: 'Comprehensive security scanning suite that identifies vulnerabilities, checks dependencies, and provides automated fixes for common security issues.',
    price: '399.99',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400',
    category: 'Security',
    salePrice: '249.99',
    discount: '37.50',
    saleCategory: 'Black Friday',
    featured: true,
    priority: 95
  },
  {
    name: 'Unit Test Generator',
    description: 'AI-powered unit test generation tool that creates comprehensive test suites for your codebase automatically.',
    price: '149.99',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
    category: 'Testing',
    salePrice: '89.99',
    discount: '40.00',
    saleCategory: 'Cyber Monday',
    featured: true,
    priority: 90
  },
  {
    name: 'Code Coverage Reporter',
    description: 'Detailed code coverage analysis with visual reports, branch coverage, and integration with popular CI/CD platforms.',
    price: '199.99',
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400',
    category: 'Testing',
    salePrice: '129.99',
    discount: '35.00',
    saleCategory: 'Cyber Monday',
    featured: false,
    priority: 85
  },
  {
    name: 'API Mocking Tool',
    description: 'Create mock APIs quickly with realistic data generation, request validation, and automatic documentation.',
    price: '179.99',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
    category: 'Testing',
    salePrice: '119.99',
    discount: '33.33',
    saleCategory: 'Black Friday',
    featured: false,
    priority: 80
  },
  {
    name: 'Dependency Checker Pro',
    description: 'Monitor your dependencies for vulnerabilities, license issues, and outdated packages. Automated updates and alerts included.',
    price: '129.99',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
    category: 'DevOps',
    salePrice: '79.99',
    discount: '38.46',
    saleCategory: 'Black Friday',
    featured: false,
    priority: 75
  },
  {
    name: 'Docker Image Optimizer',
    description: 'Reduce Docker image sizes by up to 80% with intelligent layer optimization and security scanning.',
    price: '249.99',
    image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400',
    category: 'DevOps',
    salePrice: '169.99',
    discount: '32.00',
    saleCategory: 'Cyber Monday',
    featured: false,
    priority: 70
  },
  {
    name: 'GraphQL Explorer',
    description: 'Interactive GraphQL development environment with query builder, schema visualization, and performance monitoring.',
    price: '189.99',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400',
    category: 'API',
    salePrice: '129.99',
    discount: '31.58',
    saleCategory: 'Black Friday',
    featured: false,
    priority: 65
  },
  {
    name: 'Responsive Design Tester',
    description: 'Test your web applications across multiple devices and screen sizes simultaneously with live reload and screenshot capture.',
    price: '99.99',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
    category: 'Frontend',
    salePrice: '59.99',
    discount: '40.00',
    saleCategory: 'Cyber Monday',
    featured: false,
    priority: 60
  },
  {
    name: 'Accessibility Checker',
    description: 'Ensure your applications meet WCAG standards with automated accessibility testing and detailed remediation suggestions.',
    price: '149.99',
    image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400',
    category: 'Frontend',
    salePrice: '99.99',
    discount: '33.33',
    saleCategory: 'Black Friday',
    featured: false,
    priority: 55
  },
  {
    name: 'Code Complexity Analyzer',
    description: 'Identify code smells, measure complexity metrics, and get actionable refactoring suggestions.',
    price: '169.99',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    category: 'Code Quality',
    salePrice: '109.99',
    discount: '35.29',
    saleCategory: 'Cyber Monday',
    featured: false,
    priority: 50
  },
  {
    name: 'Data Migration Assistant',
    description: 'Simplify database migrations with automated schema diff, data validation, and rollback capabilities.',
    price: '279.99',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
    category: 'Database',
    salePrice: '189.99',
    discount: '32.14',
    saleCategory: 'Black Friday',
    featured: false,
    priority: 45
  }
];

// Initial feature flags
const initialFlags = [
  { name: 'STORE_CHECKOUT_ENABLED', defaultValue: true },
  { name: 'MAIN_STORE', defaultValue: true },
  { name: 'SITE_RELAUNCH', defaultValue: false },
  { name: 'BACKEND_V2', defaultValue: true },
  { name: 'UNBORKED_V2', defaultValue: false }
];

async function seed() {
  try {
    console.log('Starting fresh database seed...');

    // Clear all existing data
    console.log('Clearing existing data...');
    await db.delete(userCarts);
    await db.delete(purchases);
    await db.delete(productMetadata);
    await db.delete(salePrices);
    await db.delete(products);
    await db.delete(saleCategories);
    await db.delete(users);
    await db.delete(flagsTable);
    console.log('Database cleared.');

    // Create sale categories
    console.log('Creating sale categories...');
    await db.insert(saleCategories).values([
      {
        name: 'Black Friday',
        description: 'Exclusive Black Friday deals',
        startDate: new Date('2024-11-29'),
        endDate: new Date('2024-11-30')
      },
      {
        name: 'Cyber Monday',
        description: 'Amazing Cyber Monday savings',
        startDate: new Date('2024-12-02'),
        endDate: new Date('2024-12-03')
      }
    ]);

    // Insert products and related data - duplicate them to create 50+ products for slow queries
    const duplicatedProducts = [];
    for (let i = 0; i < 5; i++) {
      for (const product of saleProducts) {
        duplicatedProducts.push({
          ...product,
          name: i === 0 ? product.name : `${product.name} ${i + 1}`
        });
      }
    }

    for (const product of duplicatedProducts) {
      console.log(`Creating product: ${product.name}`);

      // Insert product
      const [newProduct] = await db.insert(products).values({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category
      }).returning();

      // Insert sale price (N+1 pattern setup)
      await db.insert(salePrices).values({
        productId: newProduct.id,
        salePrice: product.salePrice
      });

      // Insert product metadata (another N+1 setup)
      await db.insert(productMetadata).values({
        productId: newProduct.id,
        discount: product.discount,
        saleCategory: product.saleCategory,
        featured: product.featured,
        priority: product.priority
      });

      console.log(`Created product ${newProduct.id} with sale data`);
    }

    // Insert initial flags
    await db.insert(flagsTable).values(initialFlags);
    console.log('Initial flags created');

    console.log('Sale data seeding completed successfully!');
    console.log(`Created ${duplicatedProducts.length} products with sale pricing`);
  } catch (error) {
    console.error('Error seeding sale data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export default seed;