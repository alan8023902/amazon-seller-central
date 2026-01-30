"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSalesData = generateSalesData;
const dataService_1 = require("../services/dataService");
function generateSalesSnapshot(storeId, productCount, totalSales, totalUnits) {
    const totalOrderItems = Math.floor(totalUnits * (0.8 + Math.random() * 0.4));
    const avgUnitsPerOrder = totalOrderItems > 0 ? Number((totalUnits / totalOrderItems).toFixed(2)) : 0;
    const avgSalesPerOrder = totalOrderItems > 0 ? Number((totalSales / totalOrderItems).toFixed(2)) : 0;
    return {
        store_id: storeId,
        total_order_items: totalOrderItems,
        units_ordered: totalUnits,
        ordered_product_sales: totalSales,
        avg_units_per_order: avgUnitsPerOrder,
        avg_sales_per_order: avgSalesPerOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}
function generateDailySalesData(storeId, totalSales, totalUnits) {
    const dailySales = [];
    const days = 30;
    const dailyBaseSales = totalSales / days;
    const dailyBaseUnits = totalUnits / days;
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        const salesVariation = 0.7 + Math.random() * 0.8;
        const unitsVariation = 0.7 + Math.random() * 0.8;
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const weekendFactor = isWeekend ? 0.7 : 1.0;
        const dailySalesAmount = Math.round(dailyBaseSales * salesVariation * weekendFactor * 100) / 100;
        const dailyUnits = Math.floor(dailyBaseUnits * unitsVariation * weekendFactor);
        const ordersCount = Math.floor(dailyUnits * (0.6 + Math.random() * 0.4));
        dailySales.push({
            store_id: storeId,
            date: date.toISOString().split('T')[0],
            sales_amount: dailySalesAmount,
            units_sold: dailyUnits,
            orders_count: ordersCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }
    return dailySales;
}
async function generateSalesData() {
    try {
        console.log('🚀 开始生成销售数据...');
        const stores = await dataService_1.dataService.readData('stores');
        const products = await dataService_1.dataService.readData('products');
        console.log(`📊 找到 ${stores.length} 个店铺，${products.length} 个产品`);
        await dataService_1.dataService.writeData('sales_snapshots', []);
        await dataService_1.dataService.writeData('daily_sales', []);
        console.log('🗑️ 清空现有销售数据');
        const allSalesSnapshots = [];
        const allDailySales = [];
        for (const store of stores) {
            console.log(`\n🏪 为店铺 "${store.name}" 生成销售数据...`);
            const storeProducts = products.filter((p) => p.store_id === store.id);
            const totalSales = storeProducts.reduce((sum, p) => {
                const sales = Number(p.sales_amount) || 0;
                return sum + sales;
            }, 0);
            const totalUnits = storeProducts.reduce((sum, p) => {
                const units = Number(p.units_sold) || 0;
                return sum + units;
            }, 0);
            const salesSnapshot = generateSalesSnapshot(store.id, storeProducts.length, totalSales, totalUnits);
            allSalesSnapshots.push(salesSnapshot);
            const dailySales = generateDailySalesData(store.id, totalSales, totalUnits);
            allDailySales.push(...dailySales);
            console.log(`✅ 为店铺 "${store.name}" 生成销售数据:`);
            console.log(`   📦 产品数量: ${storeProducts.length}`);
            console.log(`   💰 总销售额: ${totalSales.toFixed(2)} ${store.currency_symbol}`);
            console.log(`   📊 总销量: ${totalUnits} 件`);
            console.log(`   📈 每日数据: ${dailySales.length} 天`);
        }
        await dataService_1.dataService.writeData('sales_snapshots', allSalesSnapshots);
        await dataService_1.dataService.writeData('daily_sales', allDailySales);
        console.log(`\n🎉 成功生成销售数据！`);
        console.log(`📊 销售快照: ${allSalesSnapshots.length} 条`);
        console.log(`📈 每日销售: ${allDailySales.length} 条`);
        console.log('\n📈 销售数据统计:');
        allSalesSnapshots.forEach(snapshot => {
            const store = stores.find(s => s.id === snapshot.store_id);
            console.log(`🏪 ${store?.name}:`);
            console.log(`   📦 订单项: ${snapshot.total_order_items}`);
            console.log(`   📊 订购数量: ${snapshot.units_ordered}`);
            console.log(`   💰 销售额: ${snapshot.ordered_product_sales.toFixed(2)} ${store?.currency_symbol}`);
            console.log(`   📈 平均订单价值: ${snapshot.avg_sales_per_order.toFixed(2)} ${store?.currency_symbol}`);
        });
        return { success: true, salesSnapshots: allSalesSnapshots.length, dailySales: allDailySales.length };
    }
    catch (error) {
        console.error('❌ 生成销售数据失败:', error);
        throw error;
    }
}
if (require.main === module) {
    generateSalesData()
        .then(() => {
        console.log('\n✅ 销售数据生成完成！');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ 生成失败:', error);
        process.exit(1);
    });
}
