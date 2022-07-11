const puppeteer = require('puppeteer');
let len = 0;

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
      'https://www.jobkorea.co.kr/recruit/joblist?menucode=local&localorder=1#anchorGICnt_2'
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
  ]).then(companyName(),smallInfo())
  // .then(close());
  // .then(companyName())  너는 통과
  // .then(smallInfo());


  //-----------------------------------------------------------------------------------------

  // 경력, 학력, 근무지 등
    async function smallInfo() {
      let smallInfo = '//div[@class="titBx"]/ancestor::tr/td/div/p/span';
      await page.waitForXPath(smallInfo); ///()이 다돌때까지 기다린다
      temp = await page.$x(smallInfo); /// 찾아서 넣어준다

      for (item of temp){
          const value = await item.evaluate(el => el.textContent);
          console.info(value.trim())

      }
      // console.log('small_Info', temp);
    }

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
    console.log(1,len)
    console.log('list of companyName',resultCN)
    title()
  }
  
  //   공고제목
  async function title() {
    let title = '//div[@class="titBx"]/ancestor::td/div/strong/a';
    await page.waitForXPath(title); ///()이 다돌때까지 기다린다
    temp = await page.$x(title); /// 찾아서 넣어준다
    console.log('여기 돌아가나?')

    let resultTT = [];

    for (let i=0; i<len; i++){
      const value = await temp[i].evaluate((el) => el.textContent);
      let valueTrim = value.trim();
      resultTT.push(valueTrim)
    }
    
    console.log('list of title',resultTT)
  }
  console.log(222,len)
async function close(){
  await page.waitForTimeout(3000); // 눈으로 확인하기 위해 3초간 멈춤
  await browser.close(); // 브라우저 종료
}
  console.log(3333,len)
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



//div[@class="titBx"]/ancestor::tr/td/div/p/span/text() 직무, 채용, 부분 텍스트까지는 뽑아냄



*/

/*
asdasd
asd
asd
*/

/*

*/
