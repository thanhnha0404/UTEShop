require("dotenv").config();
const db = require("../models");
const Category = require("../models/category.model");
const Drink = require("../models/drink.model");

async function run() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ DB connected");
    await db.sequelize.sync({ alter: true });

    // Categories
    const categoriesData = [
      { name: "Cà phê", slug: "ca-phe" },
      { name: "Trà sữa", slug: "tra-sua" },
      { name: "Nước ép", slug: "nuoc-ep" },
      { name: "Sinh tố", slug: "sinh-to" },
    ];
    await Category.bulkCreate(categoriesData, { ignoreDuplicates: true });

    const categoryMap = {};
    for (const c of await Category.findAll()) {
      categoryMap[c.slug] = c.id;
    }

    // Drinks
    const drinksData = [
      {
        name: "Cà phê đen truyền thống",
        slug: "ca-phe-den-truyen-thong",
        description: "Cà phê đen đậm đà, thơm ngon theo phong cách truyền thống Việt Nam.",
        price: 25000,
        salePrice: 20000,
        size: "M",
        stock: 50,
        views: 0,
        sold: 30,
        image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1509042239860-f550ce908b75?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["ca-phe"],
      },
      {
        name: "Cappuccino",
        slug: "cappuccino",
        description: "Cà phê Ý với lớp foam sữa dày, thơm ngon và béo ngậy.",
        price: 45000,
        salePrice: 0,
        size: "L",
        stock: 20,
        views: 0,
        sold: 120,
        image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1509042239860-f550ce908b75?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["ca-phe"],
      },
      {
        name: "Trà sữa trân châu",
        slug: "tra-sua-tran-chau",
        description: "Trà sữa thơm ngon với trân châu dai giòn, vị ngọt thanh.",
        price: 35000,
        salePrice: 29000,
        size: "L",
        stock: 100,
        views: 0,
        sold: 300,
        image_url: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["tra-sua"],
      },
      {
        name: "Matcha Latte",
        slug: "matcha-latte",
        description: "Trà xanh matcha Nhật Bản kết hợp với sữa tươi, vị đắng nhẹ thanh mát.",
        price: 55000,
        salePrice: 45000,
        size: "L",
        stock: 60,
        views: 0,
        sold: 80,
        image_url: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["tra-sua"],
      },
      {
        name: "Nước ép cam tươi",
        slug: "nuoc-ep-cam-tuoi",
        description: "Nước ép cam tươi 100%, giàu vitamin C, tươi mát và bổ dưỡng.",
        price: 30000,
        salePrice: 25000,
        size: "M",
        stock: 150,
        views: 0,
        sold: 20,
        image_url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["nuoc-ep"],
      },
      {
        name: "Sinh tố bơ",
        slug: "sinh-to-bo",
        description: "Sinh tố bơ thơm béo, kết hợp với sữa tươi và đá xay mịn.",
        price: 40000,
        salePrice: 35000,
        size: "L",
        stock: 35,
        views: 0,
        sold: 260,
        image_url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["sinh-to"],
      },
      {
        name: "Nước ép táo",
        slug: "nuoc-ep-tao",
        description: "Nước ép táo tươi ngon, vị ngọt tự nhiên, tốt cho sức khỏe.",
        price: 28000,
        salePrice: 0,
        size: "M",
        stock: 40,
        views: 0,
        sold: 150,
        image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["nuoc-ep"],
      },
      {
        name: "Sinh tố dâu tây",
        slug: "sinh-to-dau-tay",
        description: "Sinh tố dâu tây chua ngọt, kết hợp với sữa chua và mật ong.",
        price: 45000,
        salePrice: 38000,
        size: "L",
        stock: 55,
        views: 0,
        sold: 110,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["sinh-to"],
      },
      {
        name: "Cà phê sữa đá",
        slug: "ca-phe-sua-da",
        description: "Cà phê sữa đá truyền thống Việt Nam, thơm ngon và mát lạnh.",
        price: 30000,
        salePrice: 25000,
        size: "M",
        stock: 80,
        views: 0,
        sold: 45,
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1509042239860-f550ce908b75?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["ca-phe"],
      },
      {
        name: "Trà sữa matcha",
        slug: "tra-sua-matcha",
        description: "Trà sữa matcha thơm ngon với vị đắng nhẹ và ngọt thanh.",
        price: 40000,
        salePrice: 0,
        size: "L",
        stock: 70,
        views: 0,
        sold: 25,
        image_url: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["tra-sua"],
      },
      {
        name: "Nước ép dưa hấu",
        slug: "nuoc-ep-dua-hau",
        description: "Nước ép dưa hấu tươi mát, giải nhiệt mùa hè.",
        price: 25000,
        salePrice: 20000,
        size: "M",
        stock: 120,
        views: 0,
        sold: 60,
        image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1546173159-315724a31696?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["nuoc-ep"],
      },
      {
        name: "Sinh tố xoài",
        slug: "sinh-to-xoai",
        description: "Sinh tố xoài thơm ngon, giàu vitamin C và chất xơ.",
        price: 35000,
        salePrice: 30000,
        size: "L",
        stock: 90,
        views: 0,
        sold: 40,
        image_url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["sinh-to"],
      },
      {
        name: "Americano",
        slug: "americano",
        description: "Cà phê Americano đậm đà, phù hợp cho người yêu thích vị đắng.",
        price: 35000,
        salePrice: 0,
        size: "L",
        stock: 60,
        views: 0,
        sold: 35,
        image_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1509042239860-f550ce908b75?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["ca-phe"],
      },
      {
        name: "Trà sữa thái",
        slug: "tra-sua-thai",
        description: "Trà sữa thái truyền thống với vị ngọt đặc trưng.",
        price: 32000,
        salePrice: 28000,
        size: "L",
        stock: 85,
        views: 0,
        sold: 50,
        image_url: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["tra-sua"],
      },
      {
        name: "Nước ép cà rốt",
        slug: "nuoc-ep-ca-rot",
        description: "Nước ép cà rốt tươi ngon, tốt cho mắt và sức khỏe.",
        price: 22000,
        salePrice: 0,
        size: "M",
        stock: 75,
        views: 0,
        sold: 30,
        image_url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["nuoc-ep"],
      },
      {
        name: "Sinh tố chuối",
        slug: "sinh-to-chuoi",
        description: "Sinh tố chuối bổ dưỡng, giàu kali và năng lượng.",
        price: 28000,
        salePrice: 25000,
        size: "M",
        stock: 100,
        views: 0,
        sold: 55,
        image_url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=800&auto=format&fit=crop,https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop",
        category_id: categoryMap["sinh-to"],
      },
    ];

    await Drink.bulkCreate(drinksData, { ignoreDuplicates: true });
    console.log("✅ Seed xong dữ liệu Category/Drink");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed lỗi:", err);
    process.exit(1);
  }
}

run();
