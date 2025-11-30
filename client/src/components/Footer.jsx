function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">무상매트리스케어</h3>
            <p className="text-gray-400">
              건강한 수면 환경을 위한<br />
              전문 매트리스 케어 서비스
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-gray-400">
              <li>무료 매트리스 케어</li>
              <li>진드기 제거</li>
              <li>UV 살균</li>
              <li>매트리스 상태 진단</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">연락처</h4>
            <ul className="space-y-2 text-gray-400">
              <li>전화: 010-2417-7936</li>
              <li>영업시간: 09:00 - 21:00</li>
              <li>연중무휴</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 무상매트리스케어. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
