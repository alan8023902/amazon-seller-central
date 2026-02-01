"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProductsForMainStores = generateProductsForMainStores;
const addRealisticProducts_1 = require("./addRealisticProducts");
const mainStores = [
    'store-us-main',
    'store-jp-main',
    'store-uk-main',
    'store-de-main'
];
async function generateProductsForMainStores() {
    console.log('Starting to generate products for main stores...');
    for (const storeId of mainStores) {
        console.log(`\n=== Generating products for ${storeId} ===`);
        try {
            await (0, addRealisticProducts_1.addRealisticProducts)(storeId);
            console.log(`✅ Successfully added products for ${storeId}`);
        }
        catch (error) {
            console.error(`❌ Failed to add products for ${storeId}:`, error);
        }
    }
    console.log('\n🎉 Finished generating products for all main stores!');
}
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
