# Vercel 배포 가이드

## 🚀 3단계로 끝내기!

### 1단계: Vercel에 GitHub 저장소 Import
1. https://vercel.com/new 접속
2. "Continue with GitHub" 클릭하고 로그인
3. `FreeClean-Mattress` 찾아서 **Import** 클릭

### 2단계: 환경 변수 3개 추가
아래로 스크롤해서 "Environment Variables" 섹션에 추가:

**변수 1:**
- Name: `FIREBASE_PROJECT_ID`
- Value: `freeclean-mattress`

**변수 2:**
- Name: `FIREBASE_CLIENT_EMAIL`
- Value: `firebase-adminsdk-fbsvc@freeclean-mattress.iam.gserviceaccount.com`

**변수 3:**
- Name: `FIREBASE_PRIVATE_KEY`
- Value: 아래 전체 복사해서 붙여넣기 (-----BEGIN부터 -----END까지 전부)

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCtmRYF7Hsx5sA5
yoOq/aBowQVHnzffkgxoGODMORz0JIo8k8MxXR37K58+E/XSLfRvAdbRQ+YSsQlb
NLHFcib9PvIGf733wClUARcS882ZRCqKWJNGJ+fl9BHwv6DNrxsqpxVQPdAPAPRX
VFuqlGxovM/Ji8YFoHug1/ARkLESUkygr3i4hhBWUZU6oWt+6g61KZCatPb04fiC
7CJ2FODYZ9f6nr8oOsvfh0RucpNhKeI9Sy7Tf7FcYwEyPPbDLGJNlFxrcx1MbrzA
GztQxY4vVsxPNwU0AzHWukYSk81YnfyFIxb2U6lY3k9LPkSMBy6uX9r0YslnvSg6
0c81rmWDAgMBAAECggEADbMrHcSP5FxFh0oIIhJp+lphREm4axhnij+MXhGTy2Cm
2CkBGoAywYOryYZhu/iMdcY7YcBuA8Oc7Wm3LdHYadvx1bl3EHpFyK9dVs2OyC2s
/cYHuV2k22zrjYhR9GmBR1hwQijeppB4t/ucUFXuSEW+UDWLpx4HI6Zm97vnfX6H
6KgkWhHdDVhZPL9eov7kUS7VwdRFnYbsyjhmRZDNkV5YgaDL8KFGOd5/qzub+EHZ
w1QWasFkXcnbL3noYhAU30MU/shJcMfhkShakIKqn8PjfNno327MauxLJVDfkLsF
yhCORbH++TfGDv7zbpfc7xZ8iYtrt3zBuLJX6/7YAQKBgQDbcn3e9ph7G3Zrcw9K
ezj9Hihuz+wB270YjGx6ZJARQO/odC4Q6dDhc96Idk3ehCzzXg10fBorXHxlZZUq
iB9wPRXLoyLb+U5JnhNM6ElTAZnpIPGRy+Fa0pvjxnH+Cq+x4moYl4ceNy4YPh6A
x3shzb63hGTPXDc8hwlF3iVnAQKBgQDKg4ZKQSAdFvNjVxU6cB00bqgW3q50UPND
S/iaggW+p7U4MEAYfk3bnR7bj9a8/MYwJmz1/k+XETa++b4tcd7d5us/tm5Wp5pL
e9KvmlFPc4DvBgKko75CPbLGARfd4FCRQ5Jee0vRQjh3qBmBwszQ8EydmGJLePza
NREq+7qwgwKBgFETcseuidVp5w15vBuDfSGfQ8b1ELf7DFkGgImTn9qQCFL0oZRk
HmU9XulB9DES2lyr0gLIWw7MI7V+m2bUVfEs0GGlCxsEd9UhDvZqF7UQMWH9ZuK7
1a2thCTaS4FVR2ZMRXCCg0w5jNEuGizwBmEN17mLs4cdBddZ+KYUlfMBAoGBAJ2f
1ayCGD7MGFDf/RPpI7Il1wtF879xKobc4PlR7qrA2lqLo7fsxykCmHwI7vlWPeRI
ZFLryIMq0NPAi3fPw8ov7DdBBYzJE11hWVF46YTPwDFLGk+Pa40ffMCFJVB7Qfpu
/8Qub4rG4jCwVHodZ1HRV7DqZMeduiEVYPF10Y+FAoGAbMXz+L/LKe0R5EiaXfRG
ImWlOANiZkzEhS5pP8iQbc0RGQ9VhsshC9esX46CcL4A9Ocb+Ljw4kD5yZGzAWYJ
p5yRCdeyUEKv+hIff0E59fPwf/s79Na9m/gEmjgPIC78aS+kcmG91fTqAtXZzk5Q
e/SsJfYqTh9POI8epeTIxEw=
-----END PRIVATE KEY-----
```

### 3단계: Deploy 클릭!
- **Deploy** 버튼 클릭
- 2-3분 기다리면 완료!

## ✅ 배포 완료 후
배포가 끝나면 `https://your-project.vercel.app` 같은 URL이 생깁니다!
