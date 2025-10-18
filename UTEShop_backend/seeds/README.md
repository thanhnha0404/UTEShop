# Data Seeding Scripts for UTEShop

This directory contains scripts to populate your UTEShop database with sample data for testing and development.

## Available Scripts

### 1. Basic Seed (`npm run seed`)
- **Purpose**: Creates basic categories and drinks
- **Usage**: `npm run seed`
- **Data Created**:
  - 4 categories (Cà phê, Trà sữa, Nước ép, Sinh tố)
  - 15+ drinks with realistic Vietnamese names and descriptions
  - Product images from Unsplash

### 2. Sample Data (`npm run seed:sample`)
- **Purpose**: Creates basic sample data for testing
- **Usage**: `npm run seed:sample`
- **Data Created**:
  - 50 users with realistic Vietnamese names
  - 200 orders with various statuses
  - Order items with customization options
  - Reviews for delivered orders
  - Loyalty point transactions
  - User favorites

### 3. Advanced Sample Data (`npm run seed:advanced`)
- **Purpose**: Creates comprehensive sample data for statistics testing
- **Usage**: `npm run seed:advanced`
- **Data Created**:
  - 100 users with realistic Vietnamese data
  - 500 orders distributed over 12 months
  - Realistic order progression and timestamps
  - 200+ reviews with Vietnamese comments
  - Loyalty point transactions
  - User favorites and cart items
  - Monthly order distribution patterns

## Quick Start

1. **First time setup** (creates basic data):
   ```bash
   npm run seed
   ```

2. **For basic testing** (creates moderate sample data):
   ```bash
   npm run seed:sample
   ```

3. **For comprehensive testing** (creates extensive sample data):
   ```bash
   npm run seed:advanced
   ```

## Data Characteristics

### Users
- **Names**: Realistic Vietnamese names
- **Addresses**: Vietnamese street addresses in Ho Chi Minh City
- **Phone Numbers**: Vietnamese mobile number format
- **Loyalty Points**: Random distribution (0-2000 points)

### Orders
- **Order Numbers**: Sequential format (UTE000001, UTE000002, etc.)
- **Status Distribution**: Realistic mix of all order statuses
- **Payment Methods**: COD, BANKING, MOMO
- **Time Range**: Last 12 months for advanced seed
- **Order Values**: 30,000 - 800,000 VND
- **Timestamps**: Realistic progression through order lifecycle

### Order Items
- **Quantities**: 1-3 items per order
- **Customization**: Ice level, sugar level, size options
- **Notes**: Optional customer notes

### Reviews
- **Rating Distribution**: 1-5 stars
- **Comments**: Vietnamese review comments
- **Timing**: Reviews created 1-7 days after delivery

### Loyalty Points
- **Earning**: 1 point per 10,000 VND spent
- **Usage**: Random usage for orders
- **Transactions**: Detailed transaction history

## Statistics Dashboard Data

The advanced seed script creates data specifically designed to showcase the statistics dashboard:

- **Revenue Trends**: Monthly revenue distribution
- **Order Status**: Realistic mix of pending, delivered, cancelled orders
- **Customer Growth**: New customers over time
- **Product Performance**: Best-selling products
- **Cash Flow**: Pending vs delivered order values

## Customization

You can modify the seeding scripts to:
- Change the number of users/orders generated
- Adjust date ranges
- Modify pricing ranges
- Add custom Vietnamese names/addresses
- Change order status distributions

## Important Notes

⚠️ **Warning**: These scripts will **DELETE** existing data before creating new data. Use with caution in production environments.

✅ **Safe for Development**: Perfect for development and testing environments.

🔄 **Re-runnable**: Scripts can be run multiple times to refresh data.

## Troubleshooting

### Common Issues

1. **"No drinks found" error**:
   - Run `npm run seed` first to create basic categories and drinks

2. **Database connection errors**:
   - Ensure your `.env` file has correct database credentials
   - Make sure the database server is running

3. **Memory issues with large datasets**:
   - Reduce the number of users/orders in the script
   - Run the basic seed first, then advanced seed

### Performance Tips

- For faster seeding, reduce the number of records
- Run scripts during off-peak hours
- Ensure adequate database memory allocation

## Data Verification

After running the seeds, you can verify the data by:

1. **Check user count**: `SELECT COUNT(*) FROM users;`
2. **Check order count**: `SELECT COUNT(*) FROM orders;`
3. **Check order status distribution**: `SELECT status, COUNT(*) FROM orders GROUP BY status;`
4. **Check monthly revenue**: Use the statistics dashboard at `/statistics`

## Support

If you encounter issues with the seeding scripts, check:
1. Database connection settings
2. Required dependencies are installed
3. Database has sufficient space
4. No foreign key constraint violations
