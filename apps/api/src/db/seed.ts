import { db } from './index';
import pool from '../db-config';
import { products, salePrices, productMetadata, saleCategories, users, purchases, userCarts } from './schema';

const baseProducts = [
  {
    name: 'Performance Profiler Pro',
    description: 'Advanced performance monitoring tool with real-time profiling, memory leak detection, and CPU usage analysis. Perfect for optimizing your applications.',
    price: '299.99',
    image: '/assets/images/performanceprofiler.png',
    category: 'Performance'
  },
  {
    name: 'Security Scanner Elite',
    description: 'Comprehensive security scanning suite that identifies vulnerabilities, checks dependencies, and provides automated fixes for common security issues.',
    price: '399.99',
    image: '/assets/images/securityscanner.png',
    category: 'Security'
  },
  {
    name: 'Unit Test Generator',
    description: 'AI-powered unit test generation tool that creates comprehensive test suites for your codebase automatically.',
    price: '149.99',
    image: '/assets/images/unittestgenerator.png',
    category: 'Testing'
  },
  {
    name: 'Code Coverage Reporter',
    description: 'Detailed code coverage analysis with visual reports, branch coverage, and integration with popular CI/CD platforms.',
    price: '199.99',
    image: '/assets/images/codecoveragereporter.png',
    category: 'Testing'
  },
  {
    name: 'API Mocking Tool',
    description: 'Create mock APIs quickly with realistic data generation, request validation, and automatic documentation.',
    price: '179.99',
    image: '/assets/images/apimockingtool.png',
    category: 'Testing'
  },
  {
    name: 'Docker Image Optimizer',
    description: 'Reduce Docker image sizes by up to 80% with intelligent layer optimization and security scanning.',
    price: '249.99',
    image: '/assets/images/dockerimageoptimizer.png',
    category: 'DevOps'
  },
  {
    name: 'GraphQL Explorer',
    description: 'Interactive GraphQL development environment with query builder, schema visualization, and performance monitoring.',
    price: '189.99',
    image: '/assets/images/graphqlexplorer.png',
    category: 'API'
  },
  {
    name: 'Responsive Design Tester',
    description: 'Test your web applications across multiple devices and screen sizes simultaneously with live reload and screenshot capture.',
    price: '99.99',
    image: '/assets/images/responsivedesigntester.png',
    category: 'Frontend'
  },
  {
    name: 'Accessibility Checker',
    description: 'Ensure your applications meet WCAG standards with automated accessibility testing and detailed remediation suggestions.',
    price: '149.99',
    image: '/assets/images/accessibilitychecker.png',
    category: 'Frontend'
  },
  {
    name: 'Code Complexity Analyzer',
    description: 'Identify code smells, measure complexity metrics, and get actionable refactoring suggestions.',
    price: '169.99',
    image: '/assets/images/codecomplexityanalyzer.png',
    category: 'Code Quality'
  },
  {
    name: 'Data Migration Assistant',
    description: 'Simplify database migrations with automated schema diff, data validation, and rollback capabilities.',
    price: '279.99',
    image: '/assets/images/datamigrationassistant.png',
    category: 'Database'
  },
  {
    name: 'Error Logger Pro',
    description: 'Advanced error tracking and logging solution with real-time alerts, stack trace analysis, and error grouping.',
    price: '219.99',
    image: '/assets/images/errorlogger.png',
    category: 'Monitoring'
  },
  {
    name: 'Memory Leak Detector',
    description: 'Identify and fix memory leaks in your applications with real-time memory profiling and allocation tracking.',
    price: '259.99',
    image: '/assets/images/memoryleak.png',
    category: 'Performance'
  },
  {
    name: 'Code Formatter Elite',
    description: 'Automatic code formatting with support for multiple languages, custom style guides, and team presets.',
    price: '79.99',
    image: '/assets/images/codeformatter.png',
    category: 'Code Quality'
  },
  {
    name: 'Loop Guard',
    description: 'Prevent infinite loops and detect performance bottlenecks in your code with intelligent loop analysis.',
    price: '129.99',
    image: '/assets/images/loopguard.png',
    category: 'Performance'
  },
  {
    name: 'Syntax Shield',
    description: 'Real-time syntax checking and error prevention with intelligent code completion and validation.',
    price: '99.99',
    image: '/assets/images/syntaxshield.png',
    category: 'Code Quality'
  },
  {
    name: 'Undefined Variable Detector',
    description: 'Catch undefined variables before runtime with static analysis and type checking across your entire codebase.',
    price: '139.99',
    image: '/assets/images/undefinedvariable.png',
    category: 'Code Quality'
  },
  {
    name: 'Callback Hell Resolver',
    description: 'Refactor callback-heavy code into clean async/await patterns with automatic promise conversion.',
    price: '159.99',
    image: '/assets/images/callbackhell.png',
    category: 'Code Quality'
  }
];

const saleMetadata = [
  { name: 'Performance Profiler Pro', salePrice: '199.99', saleCategory: 'Black Friday', featured: true, priority: 100 },
  { name: 'Security Scanner Elite', salePrice: '249.99', saleCategory: 'Black Friday', featured: true, priority: 95 },
  { name: 'Unit Test Generator', salePrice: '89.99', saleCategory: 'Cyber Monday', featured: true, priority: 90 },
  { name: 'Code Coverage Reporter', salePrice: '129.99', saleCategory: 'Cyber Monday', featured: false, priority: 85 },
  { name: 'API Mocking Tool', salePrice: '119.99', saleCategory: 'Black Friday', featured: false, priority: 80 },
  { name: 'Docker Image Optimizer', salePrice: '169.99', saleCategory: 'Cyber Monday', featured: false, priority: 75 },
  { name: 'GraphQL Explorer', salePrice: '129.99', saleCategory: 'Black Friday', featured: false, priority: 70 },
  { name: 'Responsive Design Tester', salePrice: '59.99', saleCategory: 'Cyber Monday', featured: false, priority: 65 },
  { name: 'Accessibility Checker', salePrice: '99.99', saleCategory: 'Black Friday', featured: false, priority: 60 },
  { name: 'Code Complexity Analyzer', salePrice: '109.99', saleCategory: 'Cyber Monday', featured: false, priority: 55 },
  { name: 'Data Migration Assistant', salePrice: '189.99', saleCategory: 'Black Friday', featured: false, priority: 50 },
  { name: 'Error Logger Pro', salePrice: '149.99', saleCategory: 'Black Friday', featured: false, priority: 45 },
  { name: 'Memory Leak Detector', salePrice: '179.99', saleCategory: 'Cyber Monday', featured: false, priority: 40 }
];

async function seedProducts() {
  console.log('Seeding products...');

  const insertedProducts = [];
  for (const product of baseProducts) {
    console.log(`Creating product: ${product.name}`);

    const [newProduct] = await db.insert(products).values({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category
    }).returning();

    insertedProducts.push(newProduct);
    console.log(`Created product ${newProduct.id}`);
  }

  console.log(`Created ${insertedProducts.length} products`);
  return insertedProducts;
}

async function seedSaleData(insertedProducts: any[]) {
  console.log('Seeding sale data...');

  // Create a map for quick lookup
  const productMap = new Map(insertedProducts.map(p => [p.name, p]));

  for (const sale of saleMetadata) {
    // Find products matching this base name
    const matchingProducts = insertedProducts.filter(p => p.name === sale.name);

    for (const product of matchingProducts) {
      console.log(`Adding sale data for: ${product.name}`);

      // Insert sale price (N+1 pattern for workshop demo)
      await db.insert(salePrices).values({
        productId: product.id,
        salePrice: sale.salePrice
      });

      // Calculate discount percentage
      const price = parseFloat(product.price);
      const salePrice = parseFloat(sale.salePrice);
      const discount = (((price - salePrice) / price) * 100).toFixed(2);

      // Insert product metadata (another N+1 for workshop demo)
      await db.insert(productMetadata).values({
        productId: product.id,
        discount: discount,
        saleCategory: sale.saleCategory,
        featured: sale.featured,
        priority: sale.priority
      });

      console.log(`Added sale data for product ${product.id}`);
    }
  }

  console.log('Sale data seeding completed');
}

async function seed() {
  try {
    console.log('Starting fresh database seed...');

    // Clear all existing data and reset sequences
    console.log('Clearing existing data...');
    await pool.query('TRUNCATE TABLE user_carts, purchases, product_metadata, sale_prices, products, sale_categories, users RESTART IDENTITY CASCADE');
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

    // Seed products first
    const insertedProducts = await seedProducts();

    // Then add sale data
    await seedSaleData(insertedProducts);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
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