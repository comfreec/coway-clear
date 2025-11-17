import admin from 'firebase-admin';

let db = null;

// Firebase 초기화 함수
function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  try {
    // 방법 1: 전체 Service Account JSON 사용
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

      // private_key의 \n을 실제 개행으로 변환
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase initialized with service account JSON');
      return admin.firestore();
    }

    // 방법 2: 개별 환경변수 사용
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Neither FIREBASE_SERVICE_ACCOUNT nor FIREBASE_PRIVATE_KEY is set');
    }

    // 여러 가지 escaping 시도
    let processedKey = privateKey;
    // 이미 실제 개행이면 그대로 사용
    if (!processedKey.includes('\\n') && processedKey.includes('\n')) {
      // 실제 개행 문자가 있음
      processedKey = privateKey;
    } else {
      // \n을 실제 개행으로 변환
      processedKey = privateKey.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: processedKey
      })
    });
    console.log('Firebase initialized with individual credentials');
    return admin.firestore();
  } catch (error) {
    console.error('Firebase 초기화 에러:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  // Firebase 초기화 (첫 요청시에만)
  try {
    if (!db) {
      db = initializeFirebase();
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Database initialization failed',
      error: error.message
    });
  }
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url.replace('/api', '');
  const method = req.method;

  try {
    // 1. 무료 케어 신청
    if (path === '/applications' && method === 'POST') {
      const {
        name, phone, address, detail_address, mattress_type,
        mattress_age, preferred_date, preferred_time, message
      } = req.body;

      const applicationData = {
        name, phone, address,
        detail_address: detail_address || '',
        mattress_type: mattress_type || '',
        mattress_age: mattress_age || '',
        preferred_date: preferred_date || '',
        preferred_time: preferred_time || '',
        message: message || '',
        status: 'pending',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('applications').add(applicationData);

      return res.json({
        success: true,
        message: '신청이 완료되었습니다.',
        applicationId: docRef.id
      });
    }

    // 2. 신청 목록 조회
    if (path === '/applications' && method === 'GET') {
      const { status } = req.query;
      let query = db.collection('applications');

      if (status) {
        query = query.where('status', '==', status);
      }

      // orderBy 제거 - Firestore 인덱스 에러 방지
      // 클라이언트에서 정렬하도록 변경
      const snapshot = await query.get();
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString()
      }))
      // 클라이언트 측에서 정렬
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json({ success: true, applications });
    }

    // 3. 신청 상태 업데이트
    if (path.startsWith('/applications/') && method === 'PATCH') {
      const id = path.split('/')[2];
      const { status } = req.body;

      await db.collection('applications').doc(id).update({ status });

      return res.json({
        success: true,
        message: '상태가 업데이트되었습니다.'
      });
    }

    // 3-1. 신청 삭제
    if (path.startsWith('/applications/') && method === 'DELETE') {
      const id = path.split('/')[2];

      await db.collection('applications').doc(id).delete();

      return res.json({
        success: true,
        message: '신청이 삭제되었습니다.'
      });
    }

    // 4. 제품 목록 조회
    if (path === '/products' && method === 'GET') {
      const snapshot = await db.collection('products').get();
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          features: Array.isArray(data.features) ? data.features : JSON.parse(data.features || '[]')
        };
      })
      // 클라이언트 측에서 정렬
      .sort((a, b) => (a.id || 0) - (b.id || 0));

      return res.json({ success: true, products });
    }

    // 5. 리뷰 목록 조회
    if (path === '/reviews' && method === 'GET') {
      const snapshot = await db.collection('reviews').get();
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString()
      }))
      // 클라이언트 측에서 정렬
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json({ success: true, reviews });
    }

    // 5-1. 리뷰 작성
    if (path === '/reviews' && method === 'POST') {
      const { name, rating, content } = req.body;

      const reviewData = {
        name, rating, content,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('reviews').add(reviewData);

      return res.json({
        success: true,
        message: '후기가 등록되었습니다.',
        reviewId: docRef.id
      });
    }

    // 6. 통계 조회
    if (path === '/stats' && method === 'GET') {
      const [
        totalApplicationsSnapshot,
        pendingApplicationsSnapshot,
        completedApplicationsSnapshot,
        totalReviewsSnapshot
      ] = await Promise.all([
        db.collection('applications').count().get(),
        db.collection('applications').where('status', '==', 'pending').count().get(),
        db.collection('applications').where('status', '==', 'completed').count().get(),
        db.collection('reviews').count().get()
      ]);

      return res.json({
        success: true,
        stats: {
          totalApplications: totalApplicationsSnapshot.data().count,
          pendingApplications: pendingApplicationsSnapshot.data().count,
          completedApplications: completedApplicationsSnapshot.data().count,
          totalReviews: totalReviewsSnapshot.data().count
        }
      });
    }

    // 7. 게시글 목록 조회
    if (path === '/posts' && method === 'GET') {
      const postsSnapshot = await db.collection('posts').get();
      const posts = [];

      for (const doc of postsSnapshot.docs) {
        const data = doc.data();
        const commentsSnapshot = await db.collection('comments').where('post_id', '==', doc.id).count().get();

        posts.push({
          id: doc.id,
          title: data.title,
          author: data.author,
          views: data.views || 0,
          created_at: data.created_at?.toDate().toISOString(),
          comment_count: commentsSnapshot.data().count
        });
      }

      // 클라이언트 측에서 정렬
      posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json({ success: true, posts });
    }

    // 8. 게시글 상세 조회
    if (path.startsWith('/posts/') && !path.includes('/comments') && method === 'GET') {
      const id = path.split('/')[2];
      const docRef = db.collection('posts').doc(id);

      await docRef.update({
        views: admin.firestore.FieldValue.increment(1)
      });

      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: '게시글을 찾을 수 없습니다.'
        });
      }

      return res.json({
        success: true,
        post: {
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate().toISOString()
        }
      });
    }

    // 9. 게시글 작성
    if (path === '/posts' && method === 'POST') {
      const { title, content, author, password, rating } = req.body;

      const postData = {
        title, content, author, password,
        rating: rating || 0,
        views: 0,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('posts').add(postData);

      return res.json({
        success: true,
        message: '게시글이 등록되었습니다.',
        postId: docRef.id
      });
    }

    // 10. 댓글 목록 조회
    if (path.includes('/comments') && method === 'GET') {
      const id = path.split('/')[2];
      const snapshot = await db.collection('comments')
        .where('post_id', '==', id)
        .get();

      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate().toISOString()
      }))
      // 클라이언트 측에서 정렬
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      return res.json({ success: true, comments });
    }

    // 11. 댓글 작성
    if (path.includes('/comments') && method === 'POST') {
      const id = path.split('/')[2];
      const { author, content } = req.body;

      const commentData = {
        post_id: id,
        author, content,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('comments').add(commentData);

      return res.json({
        success: true,
        message: '댓글이 등록되었습니다.',
        commentId: docRef.id
      });
    }

    // 매칭되는 라우트가 없음
    return res.status(404).json({
      success: false,
      message: 'Not Found'
    });

  } catch (error) {
    console.error('API 에러:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}
