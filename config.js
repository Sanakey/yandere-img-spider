export default {
  host: 'https://yande.re', // 这项一般不用改。
  savePath : './yandere', // 图片保存的主文件夹，默认为脚本当前目录的yandere文件夹。
  imgType: 0, // 3种类型， -1代表小图, 0代表中等图，1代表大图
  wait: 0, // 每下载完一张图片等待时间 秒
  pageStart: 1, // 开始下载页码
  pageCount: 1, // 总共要下载的页码数
  tags: [], // 要下载的tag关键字，只支持英文 不需要时为空就行 示例 tags: ['dakimakura','kyaru'], 意思是下载抱枕类型里的臭鼬图
}
