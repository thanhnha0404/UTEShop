import React, { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../services/api.services";
import { useNavigate, Link } from "react-router-dom";
import { getToken } from "../utils/authStorage";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await getFavorites();
      if (res.success) setFavorites(res.data.favorites || []);
      else window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: res.error || 'Không thể tải danh sách yêu thích', type: 'error' } }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const refresh = () => load();
    window.addEventListener('favorites:updated', refresh);
    return () => window.removeEventListener('favorites:updated', refresh);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Danh sách yêu thích</h1>
        <Link to="/drinks" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">Tiếp tục mua sắm</Link>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center text-gray-600 py-16">
          Chưa có sản phẩm yêu thích.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(f => (
            <div key={f.id} className="bg-white rounded-xl shadow overflow-hidden">
              <Link to={`/drink/${f.drink?.id}`} className="block">
                <img src={f.drink?.image_url || '/logo192.png'} alt={f.drink?.name} className="w-full h-48 object-cover" />
              </Link>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <Link to={`/drink/${f.drink?.id}`} className="font-semibold text-lg text-gray-800 line-clamp-2 mr-3">
                    {f.drink?.name}
                  </Link>
                  <button
                    onClick={async () => {
                      const id = f.drink?.id;
                      if (!id) return;
                      const prev = favorites;
                      setFavorites(prev.filter(x => x.id !== f.id));
                      try {
                        const res = await removeFavorite(id);
                        if (!res.success) throw new Error(res.error);
                        window.dispatchEvent(new Event('favorites:updated'));
                      } catch (e) {
                        setFavorites(prev);
                        window.dispatchEvent(new CustomEvent('toast:show', { detail: { message: 'Không thể xóa khỏi yêu thích. Vui lòng thử lại.', type: 'error' } }));
                      }
                    }}
                    className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                    title="Bỏ yêu thích"
                  >
                    ❤️
                  </button>
                </div>
                <div className="mt-2">
                  {f.drink?.salePrice ? (
                    <div>
                      <span className="text-red-600 font-bold text-lg mr-2">{Number(f.drink?.salePrice).toLocaleString()}₫</span>
                      <span className="text-gray-400 line-through text-sm">{Number(f.drink?.price).toLocaleString()}₫</span>
                    </div>
                  ) : (
                    <span className="text-gray-900 font-bold text-lg">{Number(f.drink?.price || 0).toLocaleString()}₫</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


