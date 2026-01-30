import { addRealisticProducts } from './addRealisticProducts';

// Main stores that need realistic product data
const mainStores = [
  'store-us-main',
  'store-jp-main', 
  'store-uk-main',
  'store-de-main'
];

export async function generateProductsForMainStores(): Promise<void> {
  console.log('Starting to generate products for main stores...');
  
  for (const storeId of mainStores) {
    console.log(`\n=== Generating products for ${storeId} ===`);
    try {
      await addRealisticProducts(storeId);
      console.log(`✅ Successfully added products for ${storeId}`);
    } catch (error) {
      console.error(`❌ Failed to add products for ${storeId}:`, error);
    }
  }
  
  console.log('\n🎉 Finished generating products for all main stores!');
}

// Run the function if this file is executed directly
if (require.main === module) {
  generateProductsForMainStores()
    .then(() => {
      console.log('Product generation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Product generation failed:', error);
      process.exit(1);
    });
}