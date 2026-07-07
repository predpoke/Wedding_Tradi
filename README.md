# 모바일 청첩장

GitHub Pages에 바로 올릴 수 있는 정적 모바일 청첩장입니다. 별도 서버나 데이터베이스가 필요하지 않습니다.

## 내용 바꾸기

1. `config.js`에서 이름, 날짜, 장소, 연락처, 계좌번호를 수정합니다.
2. `assets/hero-couple.png`를 실제 대표 사진으로 교체합니다.
3. 갤러리 사진을 `assets` 폴더에 넣고 `config.js`의 `gallery` 목록을 수정합니다.
4. 지도 위치는 예식장의 위도(`latitude`)와 경도(`longitude`)로 수정합니다.

## URL로 공개하기

1. GitHub에서 저장소를 새로 만듭니다. 예: `wedding-invitation`
2. 이 폴더 안의 파일을 저장소에 업로드합니다.
3. GitHub 저장소의 `Settings → Pages`로 이동합니다.
4. `Deploy from a branch`, `main`, `/ (root)`를 선택하고 저장합니다.
5. 잠시 후 `https://아이디.github.io/wedding-invitation/` 주소로 공개됩니다.

로컬 미리보기는 이 폴더에서 `python -m http.server 4173`을 실행한 뒤 `http://localhost:4173`을 열면 됩니다.

## 카카오톡 공유 연결

현재 상태에서도 휴대폰의 기본 공유창을 통해 카카오톡으로 보낼 수 있습니다. 카카오톡 전용 공유 화면과 미리보기 이미지를 사용하려면 다음 설정을 추가합니다.

1. Kakao Developers에서 애플리케이션을 만듭니다.
2. 플랫폼의 Web 사이트 도메인에 GitHub Pages 주소를 등록합니다.
3. `config.js`의 `kakaoJavascriptKey`에 JavaScript 키를 입력합니다.
4. `publicUrl`에 공개된 청첩장 주소를 입력합니다.
5. `shareImageUrl`에 외부에서 접근 가능한 대표 이미지의 절대 주소를 입력합니다.

키는 REST API 키가 아니라 **JavaScript 키**를 사용해야 합니다.
