const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin 초기화
const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function initializeFirestore() {
  console.log('Firestore 초기 데이터 설정 시작...');

  try {
    // 제품 데이터
    const products = [
      {
        id: 1,
        name: '코웨이 BEREX 스마트 매트리스 S8+',
        category: '스마트 매트리스',
        price_rental: 89000,
        price_purchase: 3200000,
        description: '수면 자세를 자동으로 인식하여 최적의 편안함을 제공하는 스마트 매트리스',
        features: ['자동 높이 조절', '수면 분석', '스마트폰 연동', '진드기 케어 시스템'],
        image_url: '/images/berex-s8.jpg'
      },
      {
        id: 2,
        name: '코웨이 BEREX 하이브리드 4',
        category: '하이브리드 매트리스',
        price_rental: 59000,
        price_purchase: 1800000,
        description: '스프링과 메모리폼의 완벽한 조화로 편안한 수면 제공',
        features: ['독립 스프링', '메모리폼', '통풍성 우수', '체압 분산'],
        image_url: '/images/berex-hybrid4.jpg'
      },
      {
        id: 3,
        name: '코웨이 BEREX 엘리트',
        category: '프리미엄 매트리스',
        price_rental: 69000,
        price_purchase: 2200000,
        description: '프리미엄 소재와 기술로 최상의 수면 경험 제공',
        features: ['천연 라텍스', '항균 처리', '온도 조절', '압력 완화'],
        image_url: '/images/berex-elite.jpg'
      }
    ];

    // 제품 추가
    for (const product of products) {
      await db.collection('products').doc(`product_${product.id}`).set(product);
      console.log(`제품 추가됨: ${product.name}`);
    }

    // 리뷰 데이터
    const reviews = [
      {
        id: 1,
        name: '김민수',
        rating: 5,
        content: '매트리스 케어 받고 나서 천식 증상이 많이 좋아졌어요. 진드기가 정말 많이 나왔다고 하더라고요. 무료로 해주셔서 감사합니다!',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 2,
        name: '이지은',
        rating: 5,
        content: '아이가 알레르기가 있어서 걱정했는데, 케어 후 훨씬 좋아졌어요. 전문가분이 친절하게 설명도 해주시고 매트리스 상태 리포트도 주셨어요.',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      },
      {
        id: 3,
        name: '박철수',
        rating: 5,
        content: '10년 된 매트리스라 걱정했는데, 케어 받고 나니 새것처럼 깨끗해졌어요. 코웨이 제품으로 교체도 고민중입니다.',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      }
    ];

    // 리뷰 추가
    for (const review of reviews) {
      await db.collection('reviews').doc(`review_${review.id}`).set(review);
      console.log(`리뷰 추가됨: ${review.name}`);
    }

    console.log('✅ Firestore 초기 데이터 설정 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

initializeFirestore();
