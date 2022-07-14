// modules
const puppeteer = require('puppeteer');
const { Op } = require('sequelize');

// models
const {
  Posting,
  Career,
  CompanyType,
  City,
  Job,
  posting_job,
} = require('./models');

// util
const { dateFormatter } = require('./util');

// 전역변수
let len = 0;
let today = new Date(); // 오늘
let tomorrow = new Date(today); //내일
tomorrow.setDate(tomorrow.getDate() + 1);
let dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
let resultCN = [];
let resultTT = [];
let resultCR = [];
let resultAD = [];
let resultCD = [];
let resultKD = [];
let resultURL = [];

(async () => {
  console.info('start');
  const browser = await puppeteer.launch({
    headless: true,
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
    page.waitForNavigation(), /// 로딩 될때까지 기다려라 의미
  ]);

  let target = "//span[text()='대기업']/ancestor::button";
  // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
  await page.waitForXPath(target);
  let s = await page.$x(target);
  s = s[0]; // page.$x()는 배열을 리턴하므로 [0] 으로 해서 첫번째 element를 사용함.

  await Promise.all([
    await s.click(),
    page.waitForNavigation(), /// 로딩 될때까지 기다려라 의미
  ]).then(nextPage());
  // .then(close());
  // .then(companyName())  너는 통과
  // .then(smallInfo());
  //   .then(companyDate())
  //   .then(keywords())

  /// 페이지 누르기 위한 함수
  async function nextPage() {
    let numofpage = 2;
    do {
      let targetPage = `//a[@href="/recruit/_GI_List?Page=${numofpage}"]`;
      // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
      await page.waitForXPath(targetPage);
      let aaa = await page.$x(targetPage);
      aaa = aaa[0];
      console.log(`it is page ${numofpage}!`);
      // if(게임잡공고가 나오면){
      //   크롤링그만해
      // }
      await companyName();
      await Promise.all([
        await aaa.evaluate((e) => e.click()),
        page.waitForNavigation(), /// 로딩 될때까지 기다려라 의미
      ]);

      numofpage++;
    } while (len);
  }

  //-----------------------------------------------------------------------------------------

  // 회사 이름
  async function companyName() {
    let companyName = '//div[@class="titBx"]/ancestor::tr/td/a';
    await page.waitForXPath(companyName); ///()이 다돌때까지 기다린다
    temp = await page.$x(companyName); /// 찾아서 넣어준다
    resultCN = [];
    for (item of temp) {
      const value = await item.evaluate((el) => el.textContent);
      let valueTrim = value.trim();
      resultCN.push(valueTrim);
    }
    len = resultCN.length;
    // console.log('length of postings', len);
    // console.log('list of companyName', resultCN);
    // console.log('count CN', resultCN.length);
    // console.log('companyName done');

    await title();
  }

  //   공고제목
  async function title() {
    let title = '//div[@class="titBx"]/ancestor::td/div/strong/a';
    await page.waitForXPath(title); ///()이 다돌때까지 기다린다
    temp = await page.$x(title); /// 찾아서 넣어준다

    resultTT = [];

    for (let i = 0; i < len; i++) {
      const value = await temp[i].evaluate((el) => el.textContent);
      let valueTrim = value.trim();
      resultTT.push(valueTrim);
    }
    // console.log('list of title', resultTT);
    // console.log('count TT', resultTT.length);
    // console.log('title done');

    await smallInfo();
  }

  //   경력, 학력, 근무지 등
  async function smallInfo() {
    let smallInfo =
      '//p[@class="etc"]/ancestor::div//div[@class="titBx"]/p[@class="etc"]/span[@class="cell"]';
    await page.waitForXPath(smallInfo); ///()이 다돌때까지 기다린다
    temp = await page.$x(smallInfo); /// 찾아서 넣어준다
    resultCR = [];
    resultAD = [];
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
        valueTrim.indexOf('만원') !== -1 ||
        valueTrim.indexOf('사원급') !== -1 ||
        valueTrim.indexOf('팀원') !== -1 ||
        valueTrim.indexOf('주임') !== -1 ||
        valueTrim.indexOf('대리') !== -1 ||
        valueTrim.indexOf('과장') !== -1 ||
        valueTrim.indexOf('차장') !== -1 ||
        valueTrim.indexOf('부장') !== -1 ||
        valueTrim.indexOf('임원') !== -1 ||
        valueTrim.indexOf('CEO') !== -1 ||
        valueTrim.indexOf('팀장') !== -1 ||
        valueTrim.indexOf('매니저') !== -1 ||
        valueTrim.indexOf('실장') !== -1 ||
        valueTrim.indexOf('파트장') !== -1 ||
        valueTrim.indexOf('그룹장') !== -1 ||
        valueTrim.indexOf('본부장') !== -1 ||
        valueTrim.indexOf('센터장') !== -1 ||
        valueTrim.indexOf('지점장') !== -1 ||
        valueTrim.indexOf('지사장') !== -1 ||
        valueTrim.indexOf('원장') !== -1 ||
        valueTrim.indexOf('국장') !== -1 ||
        valueTrim.indexOf('공장장') !== -1 ||
        valueTrim.indexOf('~') !== -1 ||
        valueTrim.indexOf('(') !== -1
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
        if (valueTrim.indexOf('·') > -1) valueTrim = '경력무관';
        if (
          valueTrim.indexOf('경력') > -1 &&
          valueTrim.indexOf('신입') === -1 &&
          valueTrim.indexOf('무관') === -1
        )
          valueTrim = '경력';
        resultCR.push(a.split(' ')[0]);
        if (
          a.split(' ')[2] === undefined ||
          a.split(' ')[2] === '전지역' ||
          a.split(' ')[2] === '중국전지역'
        )
          resultAD.push(a.split(' ')[1] + ' 전체');
        else resultAD.push(a.split(' ')[1] + ' ' + a.split(' ')[2]);
        a = valueTrim;
        if (resultCR.length > len) break;
      }
    }
    resultCR.splice(0, 1); // 배열의 0번째 인덱스인 빈 값 삭제
    resultAD.splice(0, 1); // 배열의 0번째 인덱스인 빈 값 삭제

    // console.log('list of smallinfo', resultSI);
    // console.log('count SI', resultSI.length);
    // console.log('resultCR', resultCR, 'resultAD', resultAD);

    await companyDate();
  }

  // 채용공고 날짜
  async function companyDate() {
    let companyDate = '//span[@class="date dotum"]//./text()';
    await page.waitForXPath(companyDate); ///()이 다돌때까지 기다린다
    temp = await page.$x(companyDate); /// 찾아서 넣어준다
    resultCD = [];
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
    // console.log('count CD', resultCD.length);
    // console.log('company date done');

    await getURL();
  }

  // url
  async function getURL() {
    let keywords = '//div[@class="titBx"]//a/@href';
    await page.waitForXPath(keywords); ///()이 다돌때까지 기다린다
    temp = await page.$x(keywords); /// 찾아서 넣어준다
    resultURL = [];
    for (item of temp) {
      if (resultURL.length === len) break;
      const value = await item.evaluate((el) => el.textContent);
      const fullValue = 'https://www.jobkorea.co.kr' + value;
      resultURL.push(fullValue);
    }

    await Keywords();
  }

  // 채용공고 키워드 목록
  async function Keywords() {
    let keywords = '//@data-gainfo';
    await page.waitForXPath(keywords); ///()이 다돌때까지 기다린다
    temp = await page.$x(keywords); /// 찾아서 넣어준다
    resultKD = [];

    for (item of temp) {
      if (resultKD.length === len) break;
      const value = await item.evaluate((el) => el.textContent);
      let test = JSON.parse(value); // JSON 텍스트를 JSON 객체로 변환
      resultKD.push(test.dimension44);
    }

    // // job id 테스트
    // let jobsub = resultKD[0].split(',');
    // let jobid= await Job.findOne({
    //   where:{sub: jobsub[0]}
    // })
    // console.log('list of keywords Sub', resultKD);
    // console.log('jobid는 2나와야댐 ', jobid.id);

    // console.log('count of keywords Sub', resultKD.length);
    // console.log('keywords done');
    // console.log('plz make next page');

    //  🎇db 삽입 부분🎇 
    for (let i = 0; i < len; i++) {
      let career = await Career.findOne({
        where: { type: resultCR[i] },
      });

      let companyType = await CompanyType.findOne({
        where: { type: '대기업' },
      });

      let city;

      city = await City.findOne({
        where: {
          [Op.and]: [
            { main: resultAD[i].split(' ')[0] },
            { sub: resultAD[i].split(' ')[1] },
          ],
        },
      });

      let post = await Posting.create({
        companyName: resultCN[i],
        title: resultTT[i],
        deadline: resultCD[i],
        url: resultURL[i],
        companyTypeId: companyType.id,
        careerId: career.id,
        cityId: city.id,
      });

      let jobSub = resultKD[i].split(',');
      for (let j = 0; j < jobSub.length; j++) {
        let job = await Job.findOne({
          where: { sub: jobSub[j] },
        });

        await posting_job.create({
          postingId: post.id,
          jobId: job.id,
        });
      }
    }
  }

  // console.log(222, len);
  // async function close() {
  //   await page.waitForTimeout(3000); // 눈으로 확인하기 위해 3초간 멈춤
  //   await browser.close(); // 브라우저 종료
  // }
  // console.log(3333, len);
})();

/*
//div[@class="titBx"]/ancestor::tr/td/a/text()  기업이름들

//div[@class="titBx"]/ancestor::tr/td/div/p 원하는거 다잇음


//div[@class="titBx"]/ancestor::tr/td/div/p/span  거의다 온거같음



//div[@class="titBx"]/ancestor::tr/td/div/p/span/text(${numofpage}) 직무, 채용, 부분 텍스트까지는 뽑아냄
*/

//div[@class="titBx"]//a/@href  //url
