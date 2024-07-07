import * as cheerio from 'cheerio';


export const parseBookmarks =(htmlContent: string) => {
    const $ = cheerio.load(htmlContent);
    const bookmarks: { title: string, url: string, tags: string[] }[] = [];

    $('DT > A').each((index, element) => {
        const title = $(element).text();
        const url = $(element).attr('href') || '';
        const tags: string[] = [];

        $(element).parents('DL').prev('H3').each((i, el) => {
            tags.push($(el).text());
        });

        bookmarks.push({
            title,
            url,
            tags: tags.reverse() // 反转数组以确保标签顺序正确
        });
    });

    return bookmarks;
}



export const generateRandomName = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let name = "";
  for (let i = 0; i < 8; i++) {
    name += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return name;
};