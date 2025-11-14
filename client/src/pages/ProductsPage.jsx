import { useState, useEffect } from 'react';
import axios from 'axios';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('제품 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">코웨이 매트리스 제품</h1>
          <p className="text-xl text-gray-600">
            렌탈 또는 구매로 최상의 수면 환경을 경험하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <div className="text-6xl">🛏️</div>
              </div>

              <div className="p-6">
                <div className="text-sm text-coway-blue font-semibold mb-2">
                  {product.category}
                </div>
                <h3 className="text-2xl font-bold mb-4">{product.name}</h3>
                <p className="text-gray-600 mb-6">{product.description}</p>

                <div className="mb-6">
                  <h4 className="font-semibold mb-2">주요 특징</h4>
                  <ul className="space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="text-coway-blue mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-4 space-y-2">
                  {product.price_rental && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">월 렌탈료</span>
                      <span className="text-2xl font-bold text-coway-blue">
                        {formatPrice(product.price_rental)}원
                      </span>
                    </div>
                  )}
                  {product.price_purchase && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">구매가</span>
                      <span className="text-xl font-semibold text-gray-700">
                        {formatPrice(product.price_purchase)}원
                      </span>
                    </div>
                  )}
                </div>

                <button className="w-full mt-6 bg-coway-blue text-white py-3 rounded-lg font-semibold hover:bg-coway-navy transition">
                  문의하기
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">왜 코웨이 매트리스인가요?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="font-semibold mb-2">정기 케어 서비스</h3>
              <p className="text-sm text-gray-600">
                렌탈 고객 대상 정기 무료 케어
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-semibold mb-2">품질 보증</h3>
              <p className="text-sm text-gray-600">
                업계 최고 수준의 A/S
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="font-semibold mb-2">부담 없는 렌탈</h3>
              <p className="text-sm text-gray-600">
                초기 비용 부담 없이 시작
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🌿</div>
              <h3 className="font-semibold mb-2">친환경 소재</h3>
              <p className="text-sm text-gray-600">
                인체에 무해한 자연 소재
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-coway-blue to-coway-navy text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">
            무료 케어와 함께 시작하세요
          </h2>
          <p className="text-xl mb-6 text-blue-100">
            현재 사용중인 매트리스 상태를 먼저 확인해보세요
          </p>
          <a
            href="/application"
            className="inline-block bg-white text-coway-blue px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition"
          >
            무료 케어 신청하기
          </a>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
