const puppeteer = require('puppeteer');

(async () => {
  /// 기본시작 세팅
  console.info('start');
  const browser = await puppeteer.launch({
    headless: false,
    // 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.
    args: ['--window-size=1920,1080'],
    slow: 30,
  });

  ///

  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1000,
  });

  await Promise.all([
    page.goto(
      'https://www.jobkorea.co.kr/recruit/joblist?menucode=local&localorder=1#anchorGICnt_1'
    ), // 테스트할 사이즈 주소입력
    page.waitForNavigation(), /// 로딩 될때까지 기다려라 의미
  ]);

  let targetCategory = "//span[text()='대기업']/ancestor::button";
  // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
  await page.waitForXPath(targetCategory);
  let sss = await page.$x(targetCategory);
  sss = sss[0]; // page.$x()는 배열을 리턴하므로 [0] 으로 해서 첫번째 element를 사용함.

  await Promise.all([
    await sss.click(),
    page.waitForNavigation(), /// 로딩 될때까지 기다려라 의미
  ]).then(selectCategory());
// ----------------------------------------------------------


//카테고리 누르기
async function selectCategory() {
  targetCategory= '//div[@class="tplSltBx tplGiSlt devTplSltBx"]/select[@name="orderTab"]';
  await page.select('select[name="orderTab"]','등록일순')
.then(nextPage());
}


  //---------------------------------------------------------
 /// 기업이름
  async function companyName() {
    let companyName = "//a[@href]/ancestor::div[@class='titBx']/strong";
    await page.waitForXPath(companyName); ///()이 다돌때까지 기다린다
    temp = await page.$x(companyName); /// 찾아서 넣어준다
    let resultCN = [];
    for (item of temp) {
      const value = await item.evaluate((el) => el.textContent);
      let valueTrim = value.trim();
      resultCN.push(valueTrim);
    }
    len = resultCN.length;
    console.log('length of postings', len);
    // console.log('list of   companyName', resultCN);
    console.log('count CN', resultCN);
    console.log('companyName done');

  }
 
 
  // / 페이지 누르기 위한 함수
  async function nextPage() {
    let numofpage = 2;
    do {
      console.log(`it is page ${numofpage}!`);
      let targetPage = `//a[@href="/recruit/_GI_List?Page=${numofpage}"]`;
      // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
      await page.waitForXPath(targetPage);
      let aaa = await page.$x(targetPage);
      aaa = aaa[0];
      console.log(`it is page ${numofpage}!`);3
     
      await companyName();

      await Promise.all([
        await aaa.evaluate((e) => e.click()),
        page.waitForNavigation(), /// 로딩 될때까지 기다려라 의미
      ]);

      numofpage++;
    } while (numofpage < 10);
  }


 

  // /// 크롤링 시작부분
  // await Promise.all([
  //   page.goto(
  //     `https://www.jobkorea.co.kr/recruit/joblist?menucode=local&localorder=3#anchorGICnt_${numofpage}`
  //   ), // 테스트할 사이즈 주소입력
  //   page.waitForNavigation(), /// 로딩 될때까지 기다려라 의미
  // ]);

  // let target = "//span[text()='대기업']/ancestor::button";
  // // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
  // await page.waitForXPath(target);
  // let s = await page.$x(target);
  // s = s[0];

  // await s.click(), page.waitForNavigation();

  // await page.waitForTimeout(40000); // 눈으로 확인하기 위해 3초간 멈춤
  // await browser.close(); // 브라우저 종료
})();

/////////////////////////////////////////////////////////////////////
/*

let numofpage = 1;
let tempSave = 0; //10의자리 숫자

페이지 이동 클릭 이벤트

크롤링 로직

if(numofpage % 10 ===0){ 
    tempSave = numofpage/10
    numofpage = '다음>'
    } else if(numofpage.indexOf('다음')>-1) { numofpage = tempSave*10 + 2 } 
    else { numofpage++; }


*/




//        "//a[@href]/ancestor::div[@class='titBx']/strong"