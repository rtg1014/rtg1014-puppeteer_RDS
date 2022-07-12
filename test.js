// modules
const puppeteer = require('puppeteer');
const fs = require('fs');

// util
const { dateFormatter } = require('./util');

// 전역변수
let len = 0;
let today = new Date(); // 오늘
let tomorrow = new Date(today); //내일
tomorrow.setDate(tomorrow.getDate() + 1);
let dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

(async () => {
  console.info('start');
  const browser = await puppeteer.launch({
    headless: false,
    // 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.
    args: ['--window-size=1920,1080'],
    slow: 3,
  });
  const page = await browser.newPage();

  await page.setViewport({
    width: 1920,
    height: 1000,
  });

  await Promise.all([
    page.goto(
      'https://www.jobkorea.co.kr/recruit/joblist?menucode=local&localorder=1'
    ), // 테스트할 사이즈 주소입력
    page.waitForNavigation({ waitUntil: ['networkidle2'] }), /// 로딩 될때까지 기다려라 의미
  ]);

  let target = "//span[text()='대기업']/ancestor::button";
  // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
  await page.waitForXPath(target);
  let s = await page.$x(target);
  s = s[0]; // page.$x()는 배열을 리턴하므로 [0] 으로 해서 첫번째 element를 사용함.

  await Promise.all([
    await s.click(),
    page.waitForNavigation({ waitUntil: ['networkidle2'] }), /// 로딩 될때까지 기다려라 의미
  ]).then(companyName());
  // .then(close());
  // .then(companyName())  너는 통과
  // .then(smallInfo());
  //   .then(companyDate())
  //   .then(keywords())


  //-----------------------------------------------------------------------------------------

  // 회사 이름
  async function companyName() {
    let companyName = '//div[@class="titBx"]/ancestor::tr/td/a';
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
    // console.log('list of companyName', resultCN);
    console.log('count CN', resultCN.length);
    console.log('companyName done');

    title();
  }

  //   공고제목
  async function title() {
    let title = '//div[@class="titBx"]/ancestor::td/div/strong/a';
    await page.waitForXPath(title); ///()이 다돌때까지 기다린다
    temp = await page.$x(title); /// 찾아서 넣어준다

    let resultTT = [];

    for (let i = 0; i < len; i++) {
      const value = await temp[i].evaluate((el) => el.textContent);
      let valueTrim = value.trim();
      resultTT.push(valueTrim);
    }
    // console.log('list of title', resultTT);
    console.log('count TT', resultTT.length);
    console.log('title done');

    smallInfo();
  }

  //   경력, 학력, 근무지 등
  async function smallInfo() {
    let smallInfo =
      '//p[@class="etc"]/ancestor::div//div[@class="titBx"]/p[@class="etc"]/span[@class="cell"]';
    await page.waitForXPath(smallInfo); ///()이 다돌때까지 기다린다
    temp = await page.$x(smallInfo); /// 찾아서 넣어준다
    let resultSI = [];
    let a = '';

    for (item of temp) {
      const value = await item.evaluate((el) => el.textContent);
      let valueTrim = value.replace(/ +/g, ' ');
      if (
        valueTrim.indexOf('외\n') !== -1 ||
        valueTrim.indexOf('정규직') !== -1 ||
        valueTrim.indexOf('계약직') !== -1 ||
        valueTrim.indexOf('인턴') !== -1 ||
        valueTrim.indexOf('파견직') !== -1 ||
        valueTrim.indexOf('도급') !== -1 ||
        valueTrim.indexOf('프리랜서') !== -1 ||
        valueTrim.indexOf('아르바이트') !== -1 ||
        valueTrim.indexOf('연수생') !== -1 ||
        valueTrim.indexOf('병역특례') !== -1 ||
        valueTrim.indexOf('위촉직') !== -1 ||
        valueTrim.indexOf('만원 이상') !== -1
      )
        continue;
      valueTrim = value.replace(/[0-9][년]+/g, '');
      valueTrim = valueTrim.replace('↑', '');
      valueTrim = valueTrim.replace('고졸', '');
      valueTrim = valueTrim.replace('초대졸', '');
      valueTrim = valueTrim.replace('대졸', '');
      valueTrim = valueTrim.replace('석사', '');
      valueTrim = valueTrim.replace('박사', '');
      valueTrim = valueTrim.replace('학력무관', '');
      if (
        valueTrim.indexOf('신입') === -1 &&
        valueTrim.indexOf('경력') === -1
      ) {
        if (valueTrim.length) {
          a += ' ';
          a += valueTrim;
        }
      } else {
        resultSI.push(a);
        a = valueTrim;
        if (resultSI.length > len) break;
      }
    }
    resultSI.splice(0, 1); // 배열의 0번째 인덱스인 빈 값 삭제

    // console.log('list of smallinfo', resultSI);
    console.log('count SI', resultSI.length);
    console.log('smallinfo done');

    companyDate();
  }

  // 채용공고 날짜
  async function companyDate() {
    let companyDate = '//span[@class="date dotum"]//./text()';
    await page.waitForXPath(companyDate); ///()이 다돌때까지 기다린다
    temp = await page.$x(companyDate); /// 찾아서 넣어준다
    let resultCD = [];
    for (item of temp) {
      if (resultCD.length === len) break;
      const value = await item.evaluate((el) => el.textContent);
      let valueTrim = value.trim();
      if (valueTrim.indexOf('~') > -1) {
        valueTrim =
          '2022-' + valueTrim.replace('~', '').replace('/', '-') + ' 23:59:59';
      } else if (valueTrim.indexOf('(') > -1) continue;
      else if (valueTrim.indexOf('오늘') > -1) {
        valueTrim = dateFormatter(today).substr(0, 10) + ' 23:59:59';
      } else if (valueTrim.indexOf('내일') > -1) {
        valueTrim = dateFormatter(tomorrow).substr(0, 10) + ' 23:59:59';
      } else if (valueTrim.indexOf('모레') > -1) {
        valueTrim = dateFormatter(dayAfterTomorrow).substr(0, 10) + ' 23:59:59';
      } else valueTrim = '2122-01-01 00:00:00';

      resultCD.push(valueTrim);
    }
    // console.log('list of companyDate', resultCD);
    console.log('count CD', resultCD.length);
    console.log('company date done');

    keywords();
  }

  // 채용공고 키워드 목록
  async function keywords() {
    let keywords = '//@data-gainfo';
    await page.waitForXPath(keywords); ///()이 다돌때까지 기다린다
    temp = await page.$x(keywords); /// 찾아서 넣어준다
    let resultKD = [];

    for (item of temp) {
      if (resultKD.length === len) break;
      const value = await item.evaluate((el) => el.textContent);
      let test = JSON.parse(value); // JSON 텍스트를 JSON 객체로 변환
      resultKD.push(test.dimension44);
    }
    // console.log('list of keywords Sub', resultKD);
    console.log('count of keywords Sub', resultKD.length);
    console.log('keywords done');
    console.log('plz make next page');
  }

  console.log(222, len);
  async function close() {
    await page.waitForTimeout(3000); // 눈으로 확인하기 위해 3초간 멈춤
    await browser.close(); // 브라우저 종료
  }
  console.log(3333, len);
})();

// let targetNumber1 = "//span[text()='1']/ancestor::li"
//     // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
//     await page.waitForXPath(targetNumber1)
//     let s1 = await page.$x(targetNumber1)
//     ss = ss[0]
//     await ss.click()

//     await Promise.all([
//         page.goto("https://www.jobkorea.co.kr/recruit/joblist?menucode=local&localorder=1"),      // 테스트할 사이즈 주소입력
//         page.waitForNavigation()    /// 로딩 될때까지 기다려라 의미
//     ])

//     let targetNumber2 = "//a[text()='2']"
//     // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
//     await page.waitForXPath(targetNumber2)
//     let s2 = await page.$x(targetNumber2)
//     ss = s2[0]
//     await s2.click()

/*
//div[@class="titBx"]/ancestor::tr/td/a/text()  기업이름들

//div[@class="titBx"]/ancestor::tr/td/div/p 원하는거 다잇음


//div[@class="titBx"]/ancestor::tr/td/div/p/span  거의다 온거같음



//div[@class="titBx"]/ancestor::tr/td/div/p/span/text(${numofpage}) 직무, 채용, 부분 텍스트까지는 뽑아냄



*/

/*

let numofpage = 1;
let tempSave = 0; //10의자리 숫자

페이지 이동 클릭 이벤트

크롤링 로직

if(numofpage % 10 ===0){ 
  tempSave = numofpage/10
  numofpage = '다음>'
} else if(numofpage.indexOf('다음')>-1) { numofpage = tempSave*10 + 2 } 12
else { numofpage++; }

*/

/*

*/
