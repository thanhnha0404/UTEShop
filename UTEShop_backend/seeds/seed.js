require("dotenv").config();
const db = require("../models");
const Category = require("../models/category.model");
const Product = require("../models/product.model");

async function run() {
  try {
    await db.sequelize.authenticate();
    console.log("✅ DB connected");

    await db.sequelize.sync({ alter: true });

    // Categories
    const categoriesData = [
      { name: "Sách thiếu nhi", slug: "sach-thieu-nhi" },
      { name: "Văn học", slug: "van-hoc" },
      { name: "Công nghệ", slug: "cong-nghe" },
      { name: "Kinh doanh", slug: "kinh-doanh" },
    ];
    await Category.bulkCreate(categoriesData, { ignoreDuplicates: true });

    const categoryMap = {};
    for (const c of await Category.findAll()) {
      categoryMap[c.slug] = c.id;
    }

    // Products
    const productsData = [
      {
        name: "Lập trình JavaScript cơ bản",
        slug: "lap-trinh-javascript-co-ban",
        description: "Giới thiệu JavaScript từ cơ bản đến nâng cao, kèm ví dụ thực hành.",
        price: 150000,
        salePrice: 99000,
        stock: 50,
        views: 120,
        sold: 30,
        imageUrls: [
          "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
        ],
        categoryId: categoryMap["cong-nghe"],
      },
      {
        name: "Dữ liệu & Giải thuật",
        slug: "du-lieu-giai-thuat",
        description: "Cấu trúc dữ liệu và các giải thuật phổ biến, áp dụng phỏng vấn.",
        price: 220000,
        salePrice: 0,
        stock: 20,
        views: 300,
        sold: 120,
        imageUrls: [
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
        ],
        categoryId: categoryMap["cong-nghe"],
      },
      {
        name: "Tuổi thơ dữ dội",
        slug: "tuoi-tho-du-doi",
        description: "Tác phẩm văn học nổi tiếng về tuổi thơ và chiến tranh.",
        price: 120000,
        salePrice: 99000,
        stock: 100,
        views: 500,
        sold: 300,
        imageUrls: [
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop",
        ],
        categoryId: categoryMap["van-hoc"],
      },
      {
        name: "Kinh doanh 4.0",
        slug: "kinh-doanh-4-0",
        description: "Xu hướng kinh doanh thời đại số, chiến lược và case-study.",
        price: 180000,
        salePrice: 129000,
        stock: 60,
        views: 200,
        sold: 80,
        imageUrls: [
          "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
        ],
        categoryId: categoryMap["kinh-doanh"],
      },
      {
        name: "Câu chuyện thiếu nhi",
        slug: "cau-chuyen-thieu-nhi",
        description: "Tổng hợp truyện ngắn dành cho thiếu nhi giàu tính giáo dục.",
        price: 90000,
        salePrice: 69000,
        stock: 150,
        views: 80,
        sold: 20,
        imageUrls: [
          "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop",
        ],
        categoryId: categoryMap["sach-thieu-nhi"],
      },
      {
        name: "Thuật toán nâng cao",
        slug: "thuat-toan-nang-cao",
        description: "Các thuật toán nâng cao, tối ưu và bài tập thực hành.",
        price: 300000,
        salePrice: 249000,
        stock: 35,
        views: 700,
        sold: 260,
        imageUrls: [
          "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
        ],
        categoryId: categoryMap["cong-nghe"],
      },
      {
        name: "Văn học kinh điển",
        slug: "van-hoc-kinh-dien",
        description: "Tuyển tập các tác phẩm văn học kinh điển thế giới.",
        price: 250000,
        salePrice: 0,
        stock: 40,
        views: 420,
        sold: 150,
        imageUrls: [
          "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=800&auto=format&fit=crop",
        ],
        categoryId: categoryMap["van-hoc"],
      },
      {
        name: "Khởi nghiệp thông minh",
        slug: "khoi-nghiep-thong-minh",
        description: "Từ ý tưởng đến sản phẩm, quản trị tăng trưởng hiệu quả.",
        price: 190000,
        salePrice: 149000,
        stock: 55,
        views: 260,
        sold: 110,
        imageUrls: [
          "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&auto=format&fit=crop",
        ],
        categoryId: categoryMap["kinh-doanh"],
      },
    ];

    await Product.bulkCreate(productsData, { ignoreDuplicates: true });
    console.log("✅ Seed xong dữ liệu Category/Product");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed lỗi:", err);
    process.exit(1);
  }
}

run();
