import config from "./config";
import fs from "fs-extra";
import Axios from "axios";
import Cheerio from "cheerio";
import path from "path";

let tags = config.tags.length > 0 ? config.tags.reduce((total, current) => {
  return `${total} ${current}`
}):'';
export default {
  currentPage: config.pageStart,
  imgType: '',
  // 获取主页面
  async getMainPage(page) {
    let response = '';
    await Axios.get(`${config.host}/post`, {
      params: {
        page,
        tags
      }
    }).then((res) => {
      console.log(`第${page}页html加载完毕`);
      response = res.data;
    }).catch((err) => {
      console.log(err);
    });
    return response;
  },

  // 获取下载的图片列表
  getDownloadList(html) {
    const $ = Cheerio.load(html, {
      decodeEntities: false,
    });
    if (config.imgType === -1) {
      this.imgType = `${this.getNowDate()} ${tags} mini-`;
      return this.getMiniImgs($);
    }
    if (config.imgType === 0) {
      this.imgType = `${this.getNowDate()} ${tags} Normal-`;
      return this.getNormalImgs($);
    }
    if (config.imgType === 1) {
      this.imgType = `${this.getNowDate()} ${tags} Large-`;
      return this.getLargeImgs($);
    }
  },

  getMiniImgs($) {
    let urlList = [];
    $('.thumb img').each(function (i, e) {
      urlList.push(`${$(this).attr('src')}`);
    });
    console.log(`第${this.currentPage}页小图列表收集完毕`);
    console.log(urlList);
    return urlList;
  },

  getNormalImgs($) {
    let urlList = [];
    $('.thumb').each(function (i, e) {
      urlList.push(`${config.host}${$(this).attr('href')}`);
    });
    console.log(`第${this.currentPage}页中图列表收集完毕`);
    console.log(urlList);
    return urlList;
  },

  getLargeImgs($) {
    let urlList = [];
    $('.largeimg').each(function (i, e) {
      urlList.push($(this).attr('href'));
    });
    console.log(`第${this.currentPage}页大图列表收集完毕`);
    console.log(urlList);
    return urlList;
  },

  async saveImg(url,childPath) {
    if (config.imgType === -1||config.imgType === 1) {
      return await this.saveMLImg(url,childPath);
    }
    if (config.imgType === 0) {
      return await this.saveNormalImg(url,childPath);
    }
  },

  async saveMLImg(url,childPath) {
    // let url = 'https://assets.yande.re/data/preview/6f/09/6f0907d2318d3908a26fd7e84d40ffdf.jpg';
    const ext = path.extname(url);
    let filename = `${decodeURIComponent(url.substring(url.lastIndexOf('/')+1))}`.replace(/[/\\\\:*?<>|]/gm,'');
    filename = /.*?(?:gif|png|jpg|jpeg|webp|svg|psd|bmp|tif)/.test(filename) ? filename : filename + ext;
    const file = path.join(childPath, `${filename}`);
    if (fs.existsSync(file)) {
      console.log('文件已存在');
      return false;
    };
    let res = await Axios({
      url,
      method: "GET",
      responseType: "stream",
    })
    let writer =  fs.createWriteStream(file);
    await res.data.pipe(writer);
    return  new Promise(async (resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  },

  async saveNormalImg(url,childPath) {
    let html = await this.getChildPage(url)
    const $ = Cheerio.load(html, {
      decodeEntities: false,
    });

    let imgUrl = $('#image').attr('src');
    await this.saveMLImg(imgUrl,childPath);
  },

  async getChildPage(url){
    console.log(url);
    let response = '';
    await Axios.get(url).then((res) => {
      console.log(`${url}页html加载完毕`);
      response = res.data;
    }).catch((err) => {
      console.log(err);
    });
    return response;
  },

  mkchildDir(foldername){
    let childPath = path.join(config.savePath, `${foldername}`)
    if (!fs.existsSync(childPath)) {
      fs.mkdirSync(childPath);
    };
    console.log(`子文件夹创建完毕 ${childPath}`);
    return childPath;
  },

  mkMainDir() {
    if (!fs.existsSync(config.savePath)) {
      fs.mkdirSync(config.savePath);
    };
    console.log(`主文件夹创建完毕 ${config.savePath}`);
  },
  getNowDate(){
    let date = new Date();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
  },

  sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms*1000));
}
};
