import config from "./config";
import utils from "./utils";

let currentPage = config.pageStart;

(async () => {
  main();
})()

async function main() {
  utils.mkMainDir();
  for (currentPage; currentPage < config.pageStart+config.pageCount; currentPage++) {
    await getCurrentPageDownloadList();
  }
  console.log(`所有图下载完毕`);
}

async function getCurrentPageDownloadList() {
  console.log(`请求第${currentPage}页数据中...`);
  let html = await utils.getMainPage(currentPage);
  console.log(`获取第${currentPage}页待下载的图片列表...`);
  let currentPageDownloadList = await utils.getDownloadList(html);
  await downloadList(currentPageDownloadList);
}

async function downloadList(list) {
  let childPath = utils.mkchildDir(`${utils.imgType}${currentPage}`);
  for (let i = 0; i < list.length; i++) {
    console.log(`开始下载第${currentPage}页第${i+1}张图......`);
    await utils.saveImg(list[i], childPath);
    console.log(`第${currentPage}页第${i+1}张图下载完毕!`);
    await utils.sleep(config.wait);
  }
}

