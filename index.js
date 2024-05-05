const express= require('express'); //Express 프레임워크를 불러온다.
const dotenv=require('dotenv'); //.env를 읽기 위해 사용한다.
const http=require('http'); //HTTP 서버 기능 사용 위한 모듈

const app=express(); //Express 앱 생성.
const router=express.Router(); //라우터 기능으로 코드를 직관적으로 볼수있게 나눈다.
dotenv.config(); //.env 파일을 process.env로 불러올수있게 합니다.

app.use(express.json());
const weather=require('./router/weather');  //날씨에 대한 정보를 가져오는 라우터(위도,경도조회가능)
const dust=require('./router/dust'); //초미세먼지와 지역마다의 미세먼지 정보를 가져오는 라우터.

app.set('port',process.env.PORT||3000);  //포트는 env에서 정한 번호이거나 없다면 3000번
app.use('/api/weather',weather); //각 분리된 라우터들의 경로를 지정해준다.
app.use('/api/dust',dust);
app.get('/',(req,res)=>{ //기본경로입니다.
   res.status(500).send({message:"날씨와 미세먼지 정보 조회를 해주는 api입니다."}); 
});

app.use((req,res,next)=>{
    const error= new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status=404;
    next(error); //error변수를 아래 에러처리 미들웨어에 err로 보내줍니다.
});
//모든에러를 처리해주기 위한 미들웨어로서 서버간 전달된 에러를 처리해줍니다.
app.use((err,req,res,next)=>{
    console.error(err); //콘솔에 에러 문구 띄어줌
    res.status(500).send({ //500에러로 아래는 에러메세지와 상태를 json형태로 전달.
        message:err.message ||'서버 오류',
        status: err.status ||500
    });
});

app.listen(app.get('port'),()=>{  //port번호로 서버를 구동시킵니다.
    console.log(app.get('port'),'번에서 대기중.');
});
