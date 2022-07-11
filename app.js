const puppeteer = require('puppeteer');

(async () => {
  console.info('start');
  const browser = await puppeteer.launch({
    headless: false,
    // 디폴트가 headless 라서 브라우저가 보이지 않으므로 false 해야 브라우저가 보임.
    args: ['--window-size=1920,1080'],
    slow: 30,
  });
  let a = 1;
  do {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1000,
    });

    await Promise.all([
      page.goto(
        `https://www.jobkorea.co.kr/recruit/joblist?menucode=local&localorder=3#anchorGICnt_${a}`
      ), // 테스트할 사이즈 주소입력
      page.waitForNavigation(), /// 로딩 될때까지 기다려라 의미
    ]);

    let target = "//span[text()='대기업']/ancestor::button";
    // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
    await page.waitForXPath(target);
    let s = await page.$x(target);
    s = s[0]; 

    await s.click(), page.waitForNavigation();

    /// 페이지 누르기 위한 함수
    // let targetPage = '//div[@class="tplPagination newVer"]/ul/li/a[text()="3"]//ancestor::li'
    // // await page.waitForTimeout(3000) 사이트 접속후 3초 기다림
    // await page.waitForXPath(targetPage)
    // let ss = await page.$x(targetPage)
    // ss = ss[0]
    // console.log(11111, ss[0])
    // await ss.click(),
    // page.waitForNavigation()

    // await Promise.all([
    //     page.goto("https://www.jobkorea.co.kr/recruit/joblist?menucode=local&localorder=3"),      // 테스트할 사이즈 주소입력
    //     page.waitForNavigation()    /// 로딩 될때까지 기다려라 의미
    // ])

    //ul/li/a[@href="/recruit/_GI_List?Page=3"]

    // await Promise.all([

    //        /// 로딩 될때까지 기다려라 의미
    // ])

    // target = '//td[@class="tplCo"]'
    // await page.waitForXPath(target)
    // s = await page.$x(target)

    // for (item of s) {
    //     const value = await item.evaluate(el => el.textContent);
    //     console.info('value',value)
    // }

    a++;
  } while (a <=8);
  await page.waitForTimeout(3000); // 눈으로 확인하기 위해 3초간 멈춤
  await browser.close(); // 브라우저 종료
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
