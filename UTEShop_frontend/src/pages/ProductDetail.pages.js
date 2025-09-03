import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductDetail } from "../services/product.services";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      const data = await getProductDetail(id);
      setProduct(data);
      setActiveIdx(0);
    })();
  }, [id]);

  if (!product) return <div className="max-w-5xl mx-auto p-4">Đang tải...</div>;

  const images = product.imageUrls?.length ? product.imageUrls : ["/logo192.png"];

  return (
    <div className="max-w-5xl mx-auto p-4 grid md:grid-cols-2 gap-6">
      <div>
        <div className="rounded-xl overflow-hidden shadow">
          <img src={images[activeIdx]} alt={product.name} className="w-full h-80 object-cover" />
        </div>
        <div className="flex gap-2 mt-3">
          {images.map((src, idx) => (
            <button key={idx} className={`w-20 h-16 rounded overflow-hidden border ${idx===activeIdx?"border-blue-500":"border-transparent"}`} onClick={() => setActiveIdx(idx)}>
              <img src={src} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        {product.category && (
          <p className="text-sm text-gray-500 mb-3">Danh mục: {product.category.name}</p>
        )}
        <div className="mb-4">
          {product.salePrice ? (
            <>
              <span className="text-red-600 text-2xl font-bold mr-3">{Number(product.salePrice).toLocaleString()}₫</span>
              <span className="text-gray-400 line-through">{Number(product.price).toLocaleString()}₫</span>
            </>
          ) : (
            <span className="text-gray-900 text-2xl font-bold">{Number(product.price).toLocaleString()}₫</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">Tồn kho: {product.stock}</p>
        <div className="flex items-center gap-3 mb-4">
          <button disabled={qty<=1} onClick={()=>setQty(q=>Math.max(1,q-1))} className="px-3 py-1 bg-gray-100 rounded">-</button>
          <span>{qty}</span>
          <button disabled={qty>=product.stock} onClick={()=>setQty(q=>Math.min(product.stock,q+1))} className="px-3 py-1 bg-gray-100 rounded">+</button>
        </div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold">Thêm vào giỏ</button>
        <div className="mt-6 text-gray-700 whitespace-pre-line">{product.description}</div>
      </div>
    </div>
  );
}


