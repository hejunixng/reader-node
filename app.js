const express = require('express')
const mysql = require('mysql')
const constant = require('./const')
const cors = require('cors')
const { category } = require('f:/新建文件夹 (3)/10/《vue实战微信读书 开发企业级移动web书城》课程后端源码/node-imooc-ebook/const')


const app = express()
app.use(cors());
//路由 
app.get('/', (req, res) => {
    res.send(new Date().toDateString())
  })
// mysql
function connect(){
    return mysql.createConnection({
        host:'localhost',
        user:'root',
        password:'1063378763',
        database:'book'
    })
}

// 
// app.get('/book/list',(req,res)=>{
//     // 链接数据库
//     const conn = connect();
//     conn.query('SELECT * FROM book',(err,results)=>{
//         if(err){
//             res.json({
//                 error_code:1,
//                 msg:err
//             })
//         }else{
//             // 返回jsn字符串
//             res.json({
//                 err_code:0,
//                 data:results
//             })
//         }
//         // 关闭链接
//         conn.end()
//     })
// });
// 随即选书
function randombook(n,l){
    // 每次n本，总共L本
    let rnd = [];
    for(let i = 0;i < n ;i++){
        
        rnd.push(Math.floor(Math.random() * l))
    }
    return rnd;

}
// 拼接数据
function createData(results,item){
    return handleData(results[item])
}
function handleData(data){
        // 随即抽取的数组
        // const data = results[item];
        if(!data.cover.startsWith('http://')){
            // 重新指向nginx的资源
            data['cover'] = `${constant.resUrl}/img${data.cover}`
        }
        data['selected'] = false;
        data['private'] = false;
        data['cache'] = false;
        data['haveRead'] = 0;
        return data
}


// 猜你喜欢
function createGuessYouLike(data){
    // parseiNT 变为number，原本是数组
    const n = parseInt(randombook(1,3))+1
    data['type'] = n;
    switch(n){
        case 1 :
            data['result'] = data.id % 2 === 0? '《Executing Magic》' : '《Elements Of Robotics》';
            break;
        case 2:
            data['result'] = data.id % 2 === 0? '《Improving Psychiatric Care》' : '《Programming Languages》'
            break;
        case 3:
            data['result'] = '《living with Disfigurement》';
            data['percent'] = data.id % 2 === 0? '92%' : '97%';
            break
    }

    return data
}

function createRecommed(data){
    // 阅读人数
    data['readers'] = Math.floor(data.id / 2 * randombook(1,100))
    return data
}
// 生成6个不重复
function createID(n){
    const arr = [];
    // 1~22
    constant.category.forEach((item,index)=>{
        arr.push(index + 1)
    })
    // console.log(arr);
    const result = [];
    for(let i =0 ;i<n;i++){
        const ran = Math.floor(Math.random() * (arr.length - i));
        
        result.push(arr[ran]);
        // console.log(result);
        // 最后一个覆盖被获取的书
        arr[ran] = arr[arr.length - i -1]
    }
    
    return result
        
}

// 分类
function createCategory(data){
    const categoryIds = createID(6);
    const result = [];
    categoryIds.forEach(categoryId => {
        const subList = data.filter(item => item.category === categoryId).slice(0, 4)
        subList.map(item => {
          return handleData(item)
        })
        // console.log(subList);
        result.push({
          category: categoryId,
          list: subList
        })
      })
// 有些图片不够4张，过滤

    return result.filter(item=>item.list.length === 4)
}

// 首页数据、
app.get('/book/home',(req,res)=>{
    const conn = connect();
    // 筛选 封面不为空的
    conn.query('select * from book where cover != \'\'',(err,results)=>{
        const length = results.length;
        const guessYouLike = [];
        const banner = constant.resUrl + '/home_banner.jpg';
        const recommend = [];
        const random = [];
        const featured = [];
        const categoryList = createCategory(results);
        const categories = [
            {
              category: 1,
              num: 56,
              img1: constant.resUrl + '/cover/cs/A978-3-319-62533-1_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/cs/A978-3-319-89366-2_CoverFigure.jpg'
            },
            {
              category: 2,
              num: 51,
              img1: constant.resUrl + '/cover/ss/A978-3-319-61291-1_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/ss/A978-3-319-69299-9_CoverFigure.jpg'
            },
            {
              category: 3,
              num: 32,
              img1: constant.resUrl + '/cover/eco/A978-3-319-69772-7_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/eco/A978-3-319-76222-7_CoverFigure.jpg'
            },
            {
              category: 4,
              num: 60,
              img1: constant.resUrl + '/cover/edu/A978-981-13-0194-0_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/edu/978-3-319-72170-5_CoverFigure.jpg'
            },
            {
              category: 5,
              num: 23,
              img1: constant.resUrl + '/cover/eng/A978-3-319-39889-1_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/eng/A978-3-319-00026-8_CoverFigure.jpg'
            },
            {
              category: 6,
              num: 42,
              img1: constant.resUrl + '/cover/env/A978-3-319-12039-3_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/env/A978-4-431-54340-4_CoverFigure.jpg'
            },
            {
              category: 7,
              num: 7,
              img1: constant.resUrl + '/cover/geo/A978-3-319-56091-5_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/geo/978-3-319-75593-9_CoverFigure.jpg'
            },
            {
              category: 8,
              num: 18,
              img1: constant.resUrl + '/cover/his/978-3-319-65244-3_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/his/978-3-319-92964-4_CoverFigure.jpg'
            },
            {
              category: 9,
              num: 13,
              img1: constant.resUrl + '/cover/law/2015_Book_ProtectingTheRightsOfPeopleWit.jpeg',
              img2: constant.resUrl + '/cover/law/2016_Book_ReconsideringConstitutionalFor.jpeg'
            },
            {
              category: 10,
              num: 24,
              img1: constant.resUrl + '/cover/ls/A978-3-319-27288-7_CoverFigure.jpg',
              img2: constant.resUrl + '/cover/ls/A978-1-4939-3743-1_CoverFigure.jpg'
            },
            {
              category: 11,
              num: 6,
              img1: constant.resUrl + '/cover/lit/2015_humanities.jpg',
              img2: constant.resUrl + '/cover/lit/A978-3-319-44388-1_CoverFigure_HTML.jpg'
            },
            {
              category: 12,
              num: 14,
              img1: constant.resUrl + '/cover/bio/2016_Book_ATimeForMetabolismAndHormones.jpeg',
              img2: constant.resUrl + '/cover/bio/2017_Book_SnowSportsTraumaAndSafety.jpeg'
            },
            {
              category: 13,
              num: 16,
              img1: constant.resUrl + '/cover/bm/2017_Book_FashionFigures.jpeg',
              img2: constant.resUrl + '/cover/bm/2018_Book_HeterogeneityHighPerformanceCo.jpeg'
            },
            {
              category: 14,
              num: 16,
              img1: constant.resUrl + '/cover/es/2017_Book_AdvancingCultureOfLivingWithLa.jpeg',
              img2: constant.resUrl + '/cover/es/2017_Book_ChinaSGasDevelopmentStrategies.jpeg'
            },
            {
              category: 15,
              num: 2,
              img1: constant.resUrl + '/cover/ms/2018_Book_ProceedingsOfTheScientific-Pra.jpeg',
              img2: constant.resUrl + '/cover/ms/2018_Book_ProceedingsOfTheScientific-Pra.jpeg'
            },
            {
              category: 16,
              num: 9,
              img1: constant.resUrl + '/cover/mat/2016_Book_AdvancesInDiscreteDifferential.jpeg',
              img2: constant.resUrl + '/cover/mat/2016_Book_ComputingCharacterizationsOfDr.jpeg'
            },
            {
              category: 17,
              num: 20,
              img1: constant.resUrl + '/cover/map/2013_Book_TheSouthTexasHealthStatusRevie.jpeg',
              img2: constant.resUrl + '/cover/map/2016_Book_SecondaryAnalysisOfElectronicH.jpeg'
            },
            {
              category: 18,
              num: 16,
              img1: constant.resUrl + '/cover/phi/2015_Book_TheOnlifeManifesto.jpeg',
              img2: constant.resUrl + '/cover/phi/2017_Book_Anti-VivisectionAndTheProfessi.jpeg'
            },
            {
              category: 19,
              num: 10,
              img1: constant.resUrl + '/cover/phy/2016_Book_OpticsInOurTime.jpeg',
              img2: constant.resUrl + '/cover/phy/2017_Book_InterferometryAndSynthesisInRa.jpeg'
            },
            {
              category: 20,
              num: 26,
              img1: constant.resUrl + '/cover/psa/2016_Book_EnvironmentalGovernanceInLatin.jpeg',
              img2: constant.resUrl + '/cover/psa/2017_Book_RisingPowersAndPeacebuilding.jpeg'
            },
            {
              category: 21,
              num: 3,
              img1: constant.resUrl + '/cover/psy/2015_Book_PromotingSocialDialogueInEurop.jpeg',
              img2: constant.resUrl + '/cover/psy/2015_Book_RethinkingInterdisciplinarityA.jpeg'
            },
            {
              category: 22,
              num: 1,
              img1: constant.resUrl + '/cover/sta/2013_Book_ShipAndOffshoreStructureDesign.jpeg',
              img2: constant.resUrl + '/cover/sta/2013_Book_ShipAndOffshoreStructureDesign.jpeg'
            }
          ];
        // guessYouLike
        randombook(9,length).forEach(item=>{
            guessYouLike.push(createGuessYouLike(createData(results,item)));
        })
        // recommend
        randombook(3,length).forEach(item=>{
            recommend.push(createRecommed(createData(results,item)))
        })
        // featured
        randombook(6,length).forEach(item=>{
            featured.push(createData(results,item))
        })
        randombook(1,length).forEach(item=>{
            random.push(createData(results,item))
        })
        res.json({
            guessYouLike,
            banner,
            recommend,
            featured,
            random,
            categoryList,
            categories,
            
        })


        conn.end()
    })

})

// 详情页
app.get('/book/detail',(req,res)=>{
    const conn = connect();
    const fileName = req.query.fileName;
    
    const sql = `select * from book where fileName='${fileName}'`;
    // console.log(req.query);
    conn.query(sql,(err,results)=>{
        if(err){
            res.json({
                error_code:1,
                msg:err
            })
        }else{
            if(results.length === 0){
                res.json({
                    error_code:1,
                    msg:err
                })
            }else{
                const book = handleData(results[0]);
                res.json({
                    error_code:0,
                    msg:'success',
                    data:book
                })
            }
        }
        conn.end();
    })
})

// 列表
app.get('/book/list', (req, res) => {
    const conn = connect()
    conn.query('select * from book where cover!=\'\'',
      (err, results) => {
        if (err) {
          res.json({
            error_code: 1,
            msg: '获取失败'
          })
        } else {
          results.map(item => handleData(item))
          const data = {}
          constant.category.forEach(categoryText => {
            //   console.log(categoryText);
            data[categoryText] = results.filter(item => item.categoryText === categoryText)
          })
        //   console.log(data);
          res.json({
            error_code: 0,
            msg: '获取成功',
            data: data,
            total: results.length
          })
        }
        conn.end();
      })
  })
//   搜索列表
  app.get('/book/flat-list', (req, res) => {
    const conn = connect()
    conn.query('select * from book where cover!=\'\'',
      (err, results) => {
        if (err) {
          res.json({
            error_code: 1,
            msg: '获取失败'
          })
        } else {
          
          res.json({
            error_code: 0,
            msg: '获取成功',
            data: results,
            total: results.length
          })
        }
        conn.end()
      })
  })
// 书架
app.get('/book/shelf',(req,res)=>{
    res.json({
        bookList:[]
    })
})

const server = app.listen(3000,()=>{
    console.log('success');
});