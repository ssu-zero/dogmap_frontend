# 마이페이지와 오류

`/mypage → /mypage/edit`, `/mypage → /terms/service`, `/error-demo`, 존재하지 않는 route의 `not-found.tsx`를 제공한다.

프로필 수정은 로컬 state에 저장해 마이페이지에서 즉시 표시한다. 실제 인증·프로필 API가 연결되면 provider의 mutation만 교체한다.
